import { isString } from 'lodash';
import styled, { css } from 'styled-components';
import { media } from '../../styled';

export const Container: any = styled.div`
  margin-left: auto;
  margin-right: auto;
  max-width: 1000px;
  padding-left: .5rem;
  padding-right: .5rem;
  width: 100%;
`;

export const ContainerFluid = styled(Container)`
  max-width: unset;
`;

type RowProps = {
  justify: RowPropsDefault | RowPropsBreakpoints;
}

type JustifyContentValues =
  'center' |
  'flex-end' |
  'flex-start';

interface RowPropsDefault {
  justify: JustifyContentValues;
}

interface RowPropsBreakpoints {
  justify?: {
    xs?: JustifyContentValues;
    sm?: JustifyContentValues;
    md?: JustifyContentValues;
    lg?: JustifyContentValues;
    xl?: JustifyContentValues;
  };
}

export const Row = styled.div`
  box-sizing: border-box;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-left: -.5rem;
  margin-right: -.5rem;
  ${(props: RowPropsDefault) => isString(props.justify) && css`justify-content: ${props.justify};`}
  ${(props: RowPropsBreakpoints) => props.justify && props.justify.xs && css`justify-content: ${props.justify};`}
  ${(props: RowPropsBreakpoints) => props.justify && props.justify.sm && media.breakpoint.up('sm', css`justify-content: ${props.justify};`)}
  ${(props: RowPropsBreakpoints) => props.justify && props.justify.md && media.breakpoint.up('md', css`justify-content: ${props.justify};`)}
  ${(props: RowPropsBreakpoints) => props.justify && props.justify.lg && media.breakpoint.up('lg', css`justify-content: ${props.justify};`)}
  ${(props: RowPropsBreakpoints) => props.justify && props.justify.xl && media.breakpoint.up('xl', css`justify-content: ${props.justify};`)}
`;

type ColProps = {
  xs?: number;
  md?: number;
  lg?: number;
  xl?: number;
  sm?: number;
}

export const Col = styled.div`
  box-sizing: border-box;
  min-height: 1px;
  padding-left: .5rem;
  padding-right: .5rem;
  position: relative;
  width: 100%;
  ${({ xs }: ColProps) => xs
    ? css`
      flex: 0 0 ${({ xs }: ColProps) => xs * 100}%;
      max-width: ${({ xs }: ColProps) => xs * 100}%;
    `
    : css`
      flex: 0 0 100%;
      max-width: 100%;
    `}
  ${({ sm }: ColProps) => sm && media.breakpoint.up('sm', css`
    flex: 0 0 ${({ sm }: ColProps) => sm * 100}%;
    max-width: ${({ sm }: ColProps) => sm * 100}%;
  `)}
  ${({ md }: ColProps) => md && media.breakpoint.up('md', css`
    flex: 0 0 ${({ md }: ColProps) => md * 100}%;
    max-width: ${({ md }: ColProps) => md * 100}%;
  `)}
  ${({ lg }: ColProps) => lg && media.breakpoint.up('lg', css`
    flex: 0 0 ${({ lg }: ColProps) => lg * 100}%;
    max-width: ${({ lg }: ColProps) => lg * 100}%;
  `)}
  ${({ xl }: ColProps) => xl && media.breakpoint.up('xl', css`
    flex: 0 0 ${({ xl }: ColProps) => xl * 100}%;
    max-width: ${({ xl }: ColProps) => xl * 100}%;
  `)}
`;
