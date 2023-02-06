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
        },
        {
          label: 'Reference',
          to: 'reference',
          activeBasePath: 'reference',
        },
        {
          label: 'Brandi-React',
          to: 'brandi-react',
          activeBasePath: 'brandi-react',
        },
        {
          label: 'Examples',
          to: 'examples',
          activeBasePath: 'examples',
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
              label: 'Brandi-React',
              to: 'brandi-react',
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
    algolia: {
      appId: 'ZJ99TQS6KK',
      apiKey: '4ca1bea483527bfd468f79bf940899cb',
      indexName: 'brandi-js',
    },
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
