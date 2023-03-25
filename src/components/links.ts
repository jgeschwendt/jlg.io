'use client';

import { createComponent } from '@lit-labs/react';
import { css, html, LitElement } from 'lit';
import { type StyleInfo, styleMap } from 'lit/directives/style-map.js';
import React from 'react';

class OutboundLinkWC extends LitElement {
  public href?: string;
  public styles?: StyleInfo;
  static tagName = 'outbound-link';

  static styles = css`
    a {
      color: red;
      transition: color 200ms ease-in-out;
      text-decoration: none;
    }
  `;

  static properties = {
    href: { type: String },
    styles: { type: Object },
  };

  public connectedCallback(): void {
    super.connectedCallback();
    global.console.log('OutboundLink::connectedCallback');
  }

  private onHover(event: Event): void {
    global.console.log('OutboundLink::onHover', event);
  }

  render() {
    return html`
      <a
        @mouseover=${this.onHover}
        href=${this.href}
        rel="noreferrer"
        style=${styleMap(this.styles ?? {})}
        target="_blank"
      >
        <slot></slot>
      </a>
    `;
  }
}

if (!customElements.get(OutboundLinkWC.tagName)) {
  customElements.define(OutboundLinkWC.tagName, OutboundLinkWC);
}

export const OutboundLink = createComponent({
  elementClass: OutboundLinkWC,
  react: React,
  tagName: OutboundLinkWC.tagName,
});

export const Link = {
  Outbound: OutboundLink,
};
