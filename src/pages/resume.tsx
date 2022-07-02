import { css, Global } from '@emotion/react';
import Head from 'next/head';
import { Font } from '../components';
import { experience, education, contacts } from '../content/resume';

const bp = {
  sheet: '@media (min-width: 9in), print',
  webOnly: '@media (min-width: 9in)',
};

const rgba = {
  _000_66: 'rgba(0,0,0,.66)',
  _000_87: 'rgba(0,0,0,.87)',
};

const Resume = () => (
  <>
    <Head>
      <title>Joshua L Geschwendt&mdash;Resume</title>
    </Head>
    <Font lato={['thin', 'light', 'regular', 'medium', 'bold']} />
    <Global
      styles={css({
        'html': {
          height: '100%',
        },
        'body': {
          alignItems: 'center',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          fontWeight: 300,
          justifyContent: 'center',
          lineHeight: 1,
          minHeight: ['fill-available', '100%'],
        },
        '#__next': {
          width: '100%',
        },
        'h1,h2,h3,h4,ol,p,ul': {
          margin: 0,
        },
        'ol,ul': {
          padding: 0,
        },
      })}
    />
    <div
      css={css({
        'backgroundColor': 'white',
        'display': 'flex',
        'flexDirection': 'column',
        'justifyContent': 'space-between',
        'margin': 'auto',
        'padding': '1rem 1rem 2rem',
        [bp.sheet]: {
          marginBlock: '.5in',
          minHeight: '11in',
          padding: '0.5in',
          width: '8.5in',
        },
        '@media print': {
          marginBlock: '0',
          maxHeight: '11in',
          overflow: 'hidden',
        },
      })}
    >
      <header
        css={css({
          marginBlock: '2rem',
          [bp.sheet]: {
            marginBlockStart: '.25in',
          },
        })}
      >
        <h1
          css={css({
            color: '#18453b',
            fontWeight: 500,
            fontSize: '1.375rem',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          })}
        >
          Joshua L Geschwendt
        </h1>
      </header>
      <main css={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <section
          css={css({
            display: 'flex',
            flex: 1,
            flexDirection: 'column',
            fontSize: '.875rem',
          })}
        >
          <h2
            css={css({
              color: '#18453b',
              fontSize: '.875rem',
              fontWeight: 500,
              marginBlockEnd: '1.25rem',
              textTransform: 'uppercase',
            })}
          >
            Experience
          </h2>
          <ol
            css={css({
              'display': 'flex',
              'flex': 1,
              'flexDirection': 'column',
              'justifyContent': 'space-around',
              '@media print': {
                [`& > *:nth-child(n+${experience.length})`]: {
                  display: 'none',
                },
              },
            })}
          >
            {experience.map(
              (
                [company, title, [startDate, endDate], blurb, techStack],
                key
              ) => (
                <div css={css({ marginBlockEnd: '2rem' })} key={key}>
                  <h3
                    css={css({
                      color: rgba._000_87,
                      fontSize: '1rem',
                      fontWeight: 500,
                      lineHeight: 1.25,
                      marginBlockEnd: '.5rem',
                    })}
                  >
                    {company}
                  </h3>
                  <h4
                    css={css({
                      color: rgba._000_87,
                      fontSize: '.875rem',
                      fontWeight: 400,
                      lineHeight: 1.25,
                      marginBlockEnd: '.5rem',
                    })}
                  >
                    {title}
                    <span
                      css={{
                        display: 'block',
                        marginLeft: '.5em',
                        marginRight: '.5em',
                        [bp.sheet]: {
                          'display': 'inline',
                          '::after': {
                            content: '"·"',
                          },
                        },
                      }}
                    />
                    {startDate} to {endDate}
                  </h4>
                  <p
                    css={css({
                      color: rgba._000_66,
                      lineHeight: 1.5,
                      fontWeight: 300,
                      marginBlockEnd: '.5rem',
                    })}
                  >
                    {blurb}
                  </p>
                  <dl css={css({ display: 'inline', fontWeight: 200 })}>
                    <dt css={css({ display: 'inline', marginRight: '.5rem' })}>
                      Stack:
                    </dt>
                    {techStack.map((tech) => (
                      <dd
                        css={css({
                          'display': 'inline',
                          'margin': 0,
                          'position': 'relative',
                          '&:not(:last-child)': {
                            marginRight: '1ch',
                          },
                          '&:not(:last-child)::after': {
                            content: '","',
                          },
                          [bp.sheet]: {
                            '&:not(:last-child)::after': {
                              content: '"·"',
                              marginInlineStart: '1ch',
                            },
                          },
                        })}
                        key={tech}
                      >
                        {tech}
                      </dd>
                    ))}
                  </dl>
                </div>
              )
            )}
          </ol>
        </section>
        <div
          css={{
            display: 'flex',
            flexDirection: 'column',
            [bp.sheet]: {
              flexDirection: 'row',
              justifyContent: 'space-between',
            },
          }}
        >
          <section>
            <h2
              css={css({
                color: '#18453b',
                fontSize: '.875rem',
                fontWeight: 500,
                marginBlockEnd: '1.25rem',
                textTransform: 'uppercase',
              })}
            >
              Education
            </h2>

            {education.map((lines, idx_i) => (
              <div
                css={{
                  '* + *': {
                    marginBlockStart: '.5rem',
                  },
                }}
                key={idx_i}
              >
                {lines.map((line, idx_j) => (
                  <p
                    css={{ color: rgba._000_66, fontSize: '.875rem' }}
                    key={idx_j}
                  >
                    {line}
                  </p>
                ))}
              </div>
            ))}
          </section>
          <section>
            <h2
              css={css({
                color: '#18453b',
                fontSize: '.875rem',
                fontWeight: 500,
                marginBlockEnd: '1.25rem',
                textTransform: 'uppercase',
                marginBlockStart: '2rem',
                [bp.sheet]: {
                  marginBlockStart: 'unset',
                },
              })}
            >
              Contacts
            </h2>
            <ul
              css={{
                '* + *': { marginBlockStart: '.5rem' },
                'listStyleType': 'none',
              }}
            >
              {contacts.map(([href, name]) => (
                <li key={href}>
                  <a
                    css={{
                      color: rgba._000_66,
                      fontSize: '.875rem',
                      textDecoration: 'none',
                    }}
                    href={href}
                  >
                    {name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  </>
);

export default Resume;
