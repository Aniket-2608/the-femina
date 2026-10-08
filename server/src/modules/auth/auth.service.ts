import bcrypt from 'bcryptjs';
import { User, IUserDocument } from '../../models/User.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { generateAccessToken, generateRefreshToken } from '../../utils/tokenUtils.js';
import { generateNumericOtp, hashOtp, verifyOtpHash } from '../../utils/otpGenerator.js';
import { sendEmailOtp } from '../../utils/mailer.js';
import { UserRoles } from '../../constants/roles.js';

export class AuthService {
  static async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    const existingEmail = await User.findOne({ email: data.email.toLowerCase() });
    if (existingEmail) {
      throw new AppError('An account with this email already exists.', 409, 'EMAIL_EXISTS');
    }

    const existingPhone = await User.findOne({ phone: data.phone });
    if (existingPhone) {
      throw new AppError('An account with this phone number already exists.', 409, 'PHONE_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    // Generate Dual OTPs (10 min expiry)
    const emailOtpCode = generateNumericOtp(6);
    const phoneOtpCode = generateNumericOtp(6);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await User.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email.toLowerCase(),
      phone: data.phone,
      passwordHash,
      role: UserRoles.CUSTOMER,
      isEmailVerified: false,
      isPhoneVerified: false,
      emailOtp: {
        codeHash: hashOtp(emailOtpCode),
        expiresAt: otpExpiry,
        attempts: 0,
      },
      phoneOtp: {
        codeHash: hashOtp(phoneOtpCode),
        expiresAt: otpExpiry,
        attempts: 0,
      },
    });

    // Send Email OTP via mailer (Async)
    await sendEmailOtp(newUser.email, emailOtpCode, newUser.firstName);

    // In local/dev environment, log the OTPs clearly for frictionless testing
    console.log(`\n🔑 [Verification OTPs for ${newUser.email}]`);
    console.log(`   ✉️ Email OTP: ${emailOtpCode}`);
    console.log(`   📱 Phone OTP: ${phoneOtpCode}\n`);

    return {
      userId: newUser._id,
      email: newUser.email,
      phone: newUser.phone,
      isEmailVerified: newUser.isEmailVerified,
      isPhoneVerified: newUser.isPhoneVerified,
      // Provide dev preview OTPs for test mode convenience
      devOtpPreview: {
        emailOtp: emailOtpCode,
        phoneOtp: phoneOtpCode,
      },
    };
  }

  static async verifyEmailOtp(email: string, otp: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    if (!user.emailOtp || !user.emailOtp.codeHash || !user.emailOtp.expiresAt) {
      throw new AppError('No verification code requested or already verified.', 400, 'NO_OTP_FOUND');
    }

    if (new Date() > user.emailOtp.expiresAt) {
      throw new AppError('Verification code has expired. Please request a new one.', 400, 'OTP_EXPIRED');
    }

    const isValid = verifyOtpHash(otp, user.emailOtp.codeHash);
    if (!isValid) {
      user.emailOtp.attempts += 1;
      await user.save();
      throw new AppError('Invalid verification code.', 400, 'INVALID_OTP');
    }

    user.isEmailVerified = true;
    user.emailOtp = undefined;
    await user.save();

    return this.generateAuthResponse(user);
  }

  static async verifyPhoneOtp(phone: string, otp: string) {
    const user = await User.findOne({ phone });
    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    if (!user.phoneOtp || !user.phoneOtp.codeHash || !user.phoneOtp.expiresAt) {
      throw new AppError('No SMS verification code requested or already verified.', 400, 'NO_OTP_FOUND');
    }

    if (new Date() > user.phoneOtp.expiresAt) {
      throw new AppError('SMS verification code has expired. Please request a new one.', 400, 'OTP_EXPIRED');
    }

    const isValid = verifyOtpHash(otp, user.phoneOtp.codeHash);
    if (!isValid) {
      user.phoneOtp.attempts += 1;
      await user.save();
      throw new AppError('Invalid SMS verification code.', 400, 'INVALID_OTP');
    }

    user.isPhoneVerified = true;
    user.phoneOtp = undefined;
    await user.save();

    return this.generateAuthResponse(user);
  }

  static async resendOtp(data: { email?: string; phone?: string; type: 'email' | 'phone' }) {
    let user: IUserDocument | null = null;
    if (data.type === 'email' && data.email) {
      user = await User.findOne({ email: data.email.toLowerCase() });
    } else if (data.type === 'phone' && data.phone) {
      user = await User.findOne({ phone: data.phone });
    }

    if (!user) {
      throw new AppError('User not found.', 404, 'USER_NOT_FOUND');
    }

    const otpCode = generateNumericOtp(6);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    if (data.type === 'email') {
      user.emailOtp = {
        codeHash: hashOtp(otpCode),
        expiresAt: otpExpiry,
        attempts: 0,
      };
      await user.save();
      await sendEmailOtp(user.email, otpCode, user.firstName);
      console.log(`[Auth] Resent Email OTP for ${user.email}: ${otpCode}`);
    } else {
      user.phoneOtp = {
        codeHash: hashOtp(otpCode),
        expiresAt: otpExpiry,
        attempts: 0,
      };
      await user.save();
      console.log(`[Auth] Resent Phone SMS OTP for ${user.phone}: ${otpCode}`);
    }

    return {
      message: `Verification code resent to your ${data.type}.`,
      devOtp: otpCode,
    };
  }

  static async login(email: string, password: string) {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Your account has been deactivated. Please contact support.', 403, 'ACCOUNT_DEACTIVATED');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid email or password.', 401, 'INVALID_CREDENTIALS');
    }

    user.lastLoginAt = new Date();
    await user.save();

    return this.generateAuthResponse(user);
  }

  private static generateAuthResponse(user: IUserDocument) {
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        savedAddresses: user.savedAddresses,
        defaultAddressId: user.defaultAddressId,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
}
