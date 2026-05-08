import React from 'react';

const cityBuildings = [
  { name: 'one', windowCount: 12, litWindows: [2, 7, 12] },
  { name: 'two', windowCount: 12, litWindows: [1, 6, 11] },
  { name: 'three', windowCount: 12, litWindows: [3, 8] },
  { name: 'four', windowCount: 15, litWindows: [2, 5, 13] },
  { name: 'five', windowCount: 12, litWindows: [4, 6, 10] },
  { name: 'six', windowCount: 9, litWindows: [3, 8] },
  { name: 'seven', windowCount: 12, litWindows: [2, 9] },
  { name: 'eight', windowCount: 16, litWindows: [1, 7, 14] },
  { name: 'nine', windowCount: 9, litWindows: [4, 6] },
];

function CoffeeShopScene() {
  return (
    <div className="pixel-coffee-scene" aria-hidden="true">
      <div className="pixel-sky">
        <div className="pixel-city-skyline">
          {cityBuildings.map((building) => (
            <span className={`pixel-city-building pixel-city-building-${building.name}`} key={building.name}>
              {Array.from({ length: building.windowCount }).map((_, index) => {
                const windowNumber = index + 1;
                return (
                  <span
                    className={`pixel-city-window${building.litWindows.includes(windowNumber) ? ' is-lit' : ''}`}
                    key={`city-${building.name}-${windowNumber}`}
                  />
                );
              })}
            </span>
          ))}
        </div>
        <span className="pixel-cloud pixel-cloud-one" />
        <span className="pixel-cloud pixel-cloud-two" />
        <span className="pixel-sun" />
        <span className="pixel-moon" />
      </div>
      <div className="pixel-shop">
        <div className="pixel-shop-side-wing">
          <span className="pixel-side-window" />
          <span className="pixel-side-flowerbox" />
        </div>
        <div className="pixel-chimney">
          <span className="pixel-chimney-smoke pixel-chimney-smoke-one" />
          <span className="pixel-chimney-smoke pixel-chimney-smoke-two" />
        </div>
        <div className="pixel-shop-roof" />
        <div className="pixel-string-lights">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pixel-awning">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
        <div className="pixel-shop-body">
          <span className="pixel-wall-trim" />
          <span className="pixel-wall-sconce pixel-wall-sconce-left" />
          <span className="pixel-wall-sconce pixel-wall-sconce-right" />
          <span className="pixel-wall-brick pixel-wall-brick-one" />
          <span className="pixel-wall-brick pixel-wall-brick-two" />
          <span className="pixel-wall-brick pixel-wall-brick-three" />
          <span className="pixel-wall-brick pixel-wall-brick-four" />
          <span className="pixel-wall-brick pixel-wall-brick-five" />
          <span className="pixel-wall-menu" />
          <span className="pixel-wall-vine pixel-wall-vine-left" />
          <span className="pixel-wall-vine pixel-wall-vine-door-left" />
          <span className="pixel-wall-vine pixel-wall-vine-right" />
          <div className="pixel-window pixel-window-left">
            <span className="pixel-window-shine" />
            <span className="pixel-window-cup" />
          </div>
          <div className="pixel-door">
            <span className="pixel-door-window" />
            <span className="pixel-door-knob" />
            <span className="pixel-door-mat" />
          </div>
          <div className="pixel-window pixel-window-right">
            <span className="pixel-window-shine" />
            <span className="pixel-window-plant" />
          </div>
          <div className="pixel-logo-sign">
            <span className="pixel-logo-cup" />
          </div>
        </div>
        <div className="pixel-counter">
          <span className="pixel-cup" />
          <span className="pixel-steam pixel-steam-one" />
          <span className="pixel-steam pixel-steam-two" />
        </div>
      </div>
      <div className="pixel-street">
        <div className="pixel-patio pixel-patio-left">
          <span className="pixel-umbrella" />
          <span className="pixel-table" />
          <span className="pixel-chair pixel-chair-left" />
          <span className="pixel-chair pixel-chair-right" />
        </div>
        <div className="pixel-patio pixel-patio-right">
          <span className="pixel-umbrella pixel-umbrella-small" />
          <span className="pixel-table" />
          <span className="pixel-chair pixel-chair-left" />
          <span className="pixel-chair pixel-chair-right" />
        </div>
        {/* Back path walks behind the patio umbrellas and menu board. */}
        <span className="pixel-menu-board" />
        <svg className="pixel-bike" viewBox="0 0 72 38" role="presentation" focusable="false">
          <g fill="none" stroke="#3f2a20" strokeWidth="6" strokeLinecap="square" strokeLinejoin="miter">
            <circle cx="14" cy="26" r="9" />
            <circle cx="58" cy="26" r="9" />
            <path d="M14 26 L30 12 L42 26 L24 26 L34 12 L48 12 L58 26" />
            <path d="M30 12 L27 7 M48 12 L54 7" />
          </g>
          <path d="M22 7 H33" stroke="#3f2a20" strokeWidth="5" strokeLinecap="square" />
          <path d="M54 7 H64" stroke="#3f2a20" strokeWidth="5" strokeLinecap="square" />
        </svg>
        <span className="pixel-streetlamp pixel-streetlamp-left" />
        <span className="pixel-streetlamp pixel-streetlamp-right" />
        <span className="pixel-bench pixel-bench-left" />
        <span className="pixel-bench pixel-bench-right" />
        <span className="pixel-newsstand" />
        <span className="pixel-potted-tree pixel-potted-tree-one" />
        <span className="pixel-potted-tree pixel-potted-tree-two" />
        <span className="pixel-potted-tree pixel-potted-tree-three" />
        {/* Behind every street decoration, including the menu board. */}
        <div className="pixel-people-path pixel-people-path-back">
          <span className="pixel-person pixel-person-three" />
          <span className="pixel-person pixel-person-six" />
          <span className="pixel-person pixel-person-eight" />
        </div>
        {/* Behind lamps, benches, plants, and bike; in front of umbrellas and menu board. */}
        <div className="pixel-people-path pixel-people-path-middle">
          <span className="pixel-person pixel-person-two" />
          <span className="pixel-person pixel-person-four" />
          <span className="pixel-person pixel-person-seven" />
        </div>
        {/* In front of all street decorations. */}
        <div className="pixel-people-path pixel-people-path-front">
          <span className="pixel-person pixel-person-one" />
          <span className="pixel-person pixel-person-five" />
        </div>
        <span className="pixel-planter pixel-planter-left" />
        <span className="pixel-planter pixel-planter-right" />
        <span className="pixel-tile pixel-tile-one" />
        <span className="pixel-tile pixel-tile-two" />
        <span className="pixel-tile pixel-tile-three" />
      </div>
    </div>
  );
}

export default CoffeeShopScene;
