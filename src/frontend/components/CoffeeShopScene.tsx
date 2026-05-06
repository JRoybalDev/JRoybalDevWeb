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
        <span className="pixel-menu-board" />
        <span className="pixel-bike" />
        <span className="pixel-streetlamp pixel-streetlamp-left" />
        <span className="pixel-streetlamp pixel-streetlamp-right" />
        <span className="pixel-bench pixel-bench-left" />
        <span className="pixel-bench pixel-bench-right" />
        <span className="pixel-newsstand" />
        <span className="pixel-potted-tree pixel-potted-tree-one" />
        <span className="pixel-potted-tree pixel-potted-tree-two" />
        <span className="pixel-potted-tree pixel-potted-tree-three" />
        <span className="pixel-person pixel-person-one" />
        <span className="pixel-person pixel-person-two" />
        <span className="pixel-person pixel-person-three" />
        <span className="pixel-person pixel-person-four" />
        <span className="pixel-person pixel-person-five" />
        <span className="pixel-person pixel-person-six" />
        <span className="pixel-person pixel-person-seven" />
        <span className="pixel-person pixel-person-eight" />
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
