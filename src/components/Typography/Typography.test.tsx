import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Caption, Heading1, Heading2, Heading3, Heading4, Heading5, Label, NavLabel, Text1, Text2, Text3, Text4 } from './Typography';
import styles from './Typography.module.scss';

describe('Typography', () => {
  it('renders each exported semantic variant with its expected tag', () => {
    const cases = [
      { Component: Heading1, tag: 'H1', text: 'Heading1 text' },
      { Component: Heading2, tag: 'H2', text: 'Heading2 text' },
      { Component: Heading3, tag: 'H3', text: 'Heading3 text' },
      { Component: Heading4, tag: 'SPAN', text: 'Heading4 text' },
      { Component: Heading5, tag: 'SPAN', text: 'Heading5 text' },
      { Component: Text1, tag: 'P', text: 'Text1 text' },
      { Component: Text2, tag: 'P', text: 'Text2 text' },
      { Component: Text3, tag: 'SPAN', text: 'Text3 text' },
      { Component: Text4, tag: 'SPAN', text: 'Text4 text' },
      { Component: Label, tag: 'LABEL', text: 'Label text' },
      { Component: Caption, tag: 'SPAN', text: 'Caption text' },
      { Component: NavLabel, tag: 'SPAN', text: 'NavLabel text' },
    ];

    cases.forEach(({ Component, tag, text }) => {
      const { unmount } = render(<Component>{text}</Component>);
      const element = screen.getByText(text);
      expect(element.tagName).toBe(tag);
      unmount();
    });
  });

  it('applies the variant class for a given wrapper', () => {
    render(<Text1>Body large</Text1>);
    expect(screen.getByText('Body large')).toHaveClass(styles.text1);
  });

  it('defaults to left alignment and applies no transform class', () => {
    render(<Text2>Default alignment</Text2>);

    const element = screen.getByText('Default alignment');
    expect(element).toHaveClass(styles['align-left']);
    expect(element.className).not.toContain('transform-');
  });

  it('applies a requested alignment and transform', () => {
    render(
      <Text2 align="center" transform="uppercase">
        Styled text
      </Text2>
    );

    const element = screen.getByText('Styled text');
    expect(element).toHaveClass(styles['align-center']);
    expect(element).toHaveClass(styles['transform-uppercase']);
  });

  it('omits truncation classes by default and applies them when requested', () => {
    const { rerender } = render(<Text2>No truncation</Text2>);
    expect(screen.getByText('No truncation').className).not.toContain(styles.ellipsis);

    rerender(<Text2 truncation="lineClamp-2">Truncated</Text2>);
    expect(screen.getByText('Truncated')).toHaveClass(styles['lineClamp-2']);
  });

  it('merges a custom className with the generated classes', () => {
    render(<Text2 className="custom-class">Custom</Text2>);

    const element = screen.getByText('Custom');
    expect(element).toHaveClass('custom-class');
    expect(element).toHaveClass(styles.text2);
  });

  it('applies a custom text color as an inline style', () => {
    render(<Text2 color="rgb(37, 99, 235)">Colored</Text2>);

    expect(screen.getByText('Colored')).toHaveStyle({ color: 'rgb(37, 99, 235)' });
  });

  it('forwards additional HTML attributes to the underlying element', () => {
    render(
      <Text2 id="intro" title="tooltip">
        Extra props
      </Text2>
    );

    const element = screen.getByText('Extra props');
    expect(element).toHaveAttribute('id', 'intro');
    expect(element).toHaveAttribute('title', 'tooltip');
  });

  it('allows overriding the default rendered element via the "as" prop', () => {
    render(<Heading1 as="span">Overridden tag</Heading1>);

    expect(screen.getByText('Overridden tag').tagName).toBe('SPAN');
  });
});
