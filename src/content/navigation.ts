export type NavigationItem = {
  label: string;
  href: string;
  content: string[];
};

export const siteNavigation: NavigationItem[] = [
  {
    label: 'Technology',
    href: '/technology',
    content: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed sit amet sem ac arcu tincidunt egestas.',
      'Nullam eget ligula eu lectus convallis eleifend. Integer posuere, massa non posuere pretium, erat arcu suscipit magna, vitae viverra est justo in est.',
    ],
  },
  {
    label: 'Music',
    href: '/music',
    content: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent a libero sit amet erat cursus posuere.',
      'Vivamus vitae consequat nibh. Donec vulputate, mi vel hendrerit tincidunt, neque turpis consequat ligula, vitae tincidunt metus velit a erat.',
    ],
  },
  {
    label: 'Art',
    href: '/art',
    content: [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur eget arcu aliquet, ultricies justo vitae, vehicula est.',
      'Maecenas quis lacus non mauris vulputate rhoncus. Nam id justo eu purus lacinia dictum in a lacus.',
    ],
  },
];
