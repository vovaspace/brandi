const codeTheme = require('./src/js/codeTheme.js');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Brandi',
  tagline: 'The dependency injection container powered by TypeScript.',
  url: 'https://your-docusaurus-test-site.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'images/favicon.ico',
  organizationName: 'brandi',
  projectName: 'brandi',
  themeConfig: {
    prism: {
      theme: codeTheme,
    },
    navbar: {
      title: 'Brandi',
      logo: {
        alt: 'Brandi Logo',
        src: 'images/brandi.svg',
      },
      items: [
        {
          label: 'Getting Started',
          to: 'getting-started',
          activeBasePath: 'getting-started',
          position: 'right',
        },
        {
          label: 'Reference',
          to: 'reference',
          activeBasePath: 'reference',
          position: 'right',
        },
        {
          label: 'Examples',
          to: 'examples',
          activeBasePath: 'examples',
          position: 'right',
        },
        {
          label: 'GitHub',
          href: 'https://github.com/vovaspace/brandi/',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {
              label: 'Getting Started',
              to: 'getting-started',
            },
            {
              label: 'Reference',
              to: 'reference',
            },
            {
              label: 'Examples',
              to: 'examples',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/vovaspace/brandi/',
            },
          ],
        },
      ],
      logo: {
        alt: 'Brandi Logo',
        src: 'images/brandi.svg',
        href: '/',
      },
      copyright: `Copyright © ${new Date().getFullYear()} Vladimir Lewandowski. Built with Docusaurus.`,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    sidebarCollapsible: false,
    hideableSidebar: false,
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          path: '../docs',
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/vovaspace/brandi/edit/main/docs/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
