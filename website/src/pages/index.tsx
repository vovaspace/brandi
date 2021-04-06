import React, { FC, ReactNode } from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

import styles from './index.module.css';

const features = [
  {
    id: 'framework-agnostic',
    title: 'Framework Agnostic',
    imageUrl: 'images/cubes.svg',
    description: 'Can work with any UI or server framework.',
  },
  {
    id: 'lightweight-and-effective',
    title: 'Lightweight and Effective',
    imageUrl: 'images/lightning.svg',
    description: 'Brandi is tiny and designed for maximum performance.',
  },
  {
    id: 'strongly-typed',
    title: 'Strongly Typed',
    imageUrl: 'images/weapon.svg',
    description: 'TypeScript support out of box.',
  },
  {
    id: 'decorators-free',
    title: 'Decorators Free',
    imageUrl: 'images/ok.svg',
    description: (
      <>
        Does not require additional parameters in <code>tsconfig.json</code> and{' '}
        <code>Reflect</code> polyfill.
      </>
    ),
  },
];

const Feature: FC<{
  imageUrl: string;
  title: string;
  description: ReactNode;
}> = ({ imageUrl, title, description }) => {
  const imgUrl = useBaseUrl(imageUrl);

  return (
    <div className="col col--3">
      {imgUrl && (
        <div>
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
};

export default function Home() {
  const context = useDocusaurusContext();
  const { siteConfig = {} } = context;

  return (
    <Layout
      title={`Hello from ${siteConfig.title}`}
      description="The dependency injection container powered by TypeScript."
    >
      <header className={styles.hero}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <Link
            className="button button--primary button--lg"
            to={useBaseUrl('/getting-started')}
          >
            Get Started
          </Link>
        </div>
      </header>
      <main>
        {features && features.length > 0 && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((feature) => (
                  <Feature
                    key={feature.id}
                    title={feature.title}
                    imageUrl={feature.imageUrl}
                    description={feature.description}
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}
