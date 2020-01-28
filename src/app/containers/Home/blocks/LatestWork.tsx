import * as React from 'react';
import { ClientRect } from '../../../components';
import styled, { css, media } from '../../../styled';

const LatestWork = styled.div`
`;

const Links = styled.div`
  background-color: white;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  padding: 4rem 0;

  &:hover {
    cursor: pointer;
  }
`;

const Link = styled.a`
  border: 1px solid #333;
  border-radius: .5rem;
  color: white;
  margin: .5rem;
  overflow: hidden;
  padding: 0;
  text-decoration: none;
  width: 100%;

  ${media.breakpoint.up('sm', css`
    width: ${(1 / 2) * 100}%;
  `)}

  ${media.breakpoint.up('md', css`
    width: ${(1 / 3) * 100}%;
  `)}

  ${media.breakpoint.up('lg', css`
    width: ${(1 / 4) * 100}%;
  `)}

  ${media.breakpoint.up('xl', css`
    width: ${(1 / 5) * 100}%;
  `)}
`;

const Box = styled.div`
  background-color: #555;
  padding: .5rem;
`;
const BoxUrl = styled.div`
  background-color: #333;
  border-radius: 20px;
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: .75rem;
  padding: .5rem 1rem;
`;

const deriveRatio = (ratio, viewport): number => {
  const [x, y] = ratio.split(':');
  return ((parseInt(y, 10) / parseInt(x, 10)) * viewport);
};

const AspectRatio = styled.div`
   padding-top: 100%; /* 1:1 Aspect Ratio */
   position: relative;
   width: 100%;

   & > * {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
   }
`;

const IFrame = styled.iframe`
  border: 0;
  height: ${({ aspectRatio, viewport }): number => deriveRatio(aspectRatio, viewport)}px;
  pointer-events: none;
  transform-origin: 0 0;
  transform: scale(${({ scale, viewport }): number => (scale / viewport)});
  width: ${({ viewport }): number => viewport}px;
`;

const Statement = styled.p`
  color: white;
  text-transform: uppercase;
  text-align: center;
`;

interface PropTypes {
  className: string | null;
}

const LatestWorkComponent = (props: PropTypes): JSX.Element => (
  <LatestWork {...props}>
    <Statement>Recent Public Projects</Statement>
    <Links>{[
      'https://www.hurleyfoundation.org',
      'https://imcs.solutions',
      'https://www.dig.solutions',
    ].map((url): JSX.Element => (
      <Link href={url} key={url} target='_blank'>
        <Box>
          <BoxUrl>{url}</BoxUrl>
        </Box>
        <AspectRatio>
          <ClientRect>{({ width }): JSX.Element => (
            <IFrame
              aspectRatio='1:1'
              frameBorder='0'
              scale={width}
              src={url}
              viewport={1280}
            />
          )}</ClientRect>
        </AspectRatio>
      </Link>
    ))}</Links>
  </LatestWork>
);

export default LatestWorkComponent;