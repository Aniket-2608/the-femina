export const UserRoles = {
  CUSTOMER: 'customer',
  SUPER_ADMIN: 'super_admin',
  INVENTORY_MANAGER: 'inventory_manager',
  SALES_MANAGER: 'sales_manager',
  ACCOUNTANT: 'accountant',
  CONTENT_MANAGER: 'content_manager',
} as const;

export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

export const AdminRoles: UserRole[] = [
  UserRoles.SUPER_ADMIN,
  UserRoles.INVENTORY_MANAGER,
  UserRoles.SALES_MANAGER,
  UserRoles.ACCOUNTANT,
  UserRoles.CONTENT_MANAGER,
];
