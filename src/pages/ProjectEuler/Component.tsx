import React from 'react';
import styled from 'styled-components';

const Frame = styled.iframe`
  background-color: #fff;
  border: 0;
  min-height: 100vh;
  width: 100%;
`;

export const ProjectEuler = (): JSX.Element => (
  <Frame src="test-report.html" />
);
