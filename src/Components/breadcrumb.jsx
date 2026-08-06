/* Shared breadcrumb — one nav pattern for every screen.
   tier="t1": hero / top-bar breadcrumb (module list, all-features, project detail, experience)
   tier="t2": in-content header breadcrumb (editor) */
import React from 'react';

export function Breadcrumb({ items, tier = 't1' }) {
  return (
    <div className={'bc-' + tier}>
      {items.map((x, i) => (
        <React.Fragment key={i}>
          {i > 0 && <i className="ti ti-chevron-right bc-sep"></i>}
          {x.onClick ? (
            <button className={'bc-item bc-link' + (i === items.length - 1 ? ' bc-item--active' : '')} onClick={x.onClick}>
              {i === 0 && <i className="ti ti-arrow-left bc-back-ic"></i>}
              {x.label}
            </button>
          ) : (
            <span className={'bc-item' + (i === items.length - 1 ? ' bc-item--active' : '')}>{x.label}</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;
