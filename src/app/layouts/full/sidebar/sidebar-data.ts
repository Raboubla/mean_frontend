import { NavItem } from './nav-item/nav-item';

export const navItems: NavItem[] = [
  {
    navCap: 'Home',
  },
  {
    displayName: 'Dashboard',
    iconName: 'solar:widget-add-line-duotone',
    route: '/admin/dashboard',
  },
  {
    displayName: 'Users',
    iconName: 'solar:users-group-rounded-line-duotone',
    route: '/admin/users',
  },
  {
    displayName: 'Shops',
    iconName: 'solar:shop-2-line-duotone',
    route: '/admin/shops',
  },
  {
    displayName: 'Products',
    iconName: 'solar:box-minimalistic-line-duotone',
    route: '/admin/products',
  },
  {
    displayName: 'Sales',
    iconName: 'solar:bill-list-line-duotone',
    route: '/admin/sales',
  },
  {
    displayName: 'Reviews',
    iconName: 'solar:danger-circle-line-duotone', // Or star-line-duotone
    route: '/admin/reviews',
  },
  {
    displayName: 'Communications',
    iconName: 'solar:file-text-line-duotone',
    route: '/admin/communications',
  },
  // {
  //   navCap: 'Ui Components',
  //   divider: true
  // },
  // {
  //   displayName: 'Badge',
  //   iconName: 'solar:archive-minimalistic-line-duotone',
  //   route: '/admin/ui-components/badge',
  // },
  // {
  //   displayName: 'Chips',
  //   iconName: 'solar:danger-circle-line-duotone',
  //   route: '/admin/ui-components/chips',
  // },
  // {
  //   displayName: 'Lists',
  //   iconName: 'solar:bookmark-square-minimalistic-line-duotone',
  //   route: '/admin/ui-components/lists',
  // },
  // {
  //   displayName: 'Menu',
  //   iconName: 'solar:file-text-line-duotone',
  //   route: '/admin/ui-components/menu',
  // },
  // {
  //   displayName: 'Tooltips',
  //   iconName: 'solar:text-field-focus-line-duotone',
  //   route: '/admin/ui-components/tooltips',
  // },
  // {
  //   displayName: 'Forms',
  //   iconName: 'solar:file-text-line-duotone',
  //   route: '/admin/ui-components/forms',
  // },
  // {
  //   displayName: 'Tables',
  //   iconName: 'solar:tablet-line-duotone',
  //   route: '/admin/ui-components/tables',
  // },
  {
    navCap: 'Auth',
    divider: true
  },
  {
    displayName: 'Login',
    iconName: 'solar:login-3-line-duotone',
    route: '/authentication/login',
  },
  // {
  //   displayName: 'Register',
  //   iconName: 'solar:user-plus-rounded-line-duotone',
  //   route: '/authentication/register',
  // },

];
