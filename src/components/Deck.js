import React, { useEffect, useState } from "react";
import { useSprings } from "react-spring/hooks";
import { useGesture } from "react-with-gesture";
import Card from "./Card";

import "../styles/Deck.css";
import { hasSelectionSupport } from "@testing-library/user-event/dist/utils";

let cards = [0, 1, 2, 3, 4];

const to = (i) => ({
  x: 0,
  y: i * -10,
  scale: 1,
  rot: -10 + Math.random() * 20,
  delay: i * 100,
});
const from = (i) => ({ rot: 0, scale: 1.5, y: -1000 });

const trans = (r, s) =>
  `perspective(1500px) rotateX(30deg) rotateY(${
    r / 10
  }deg) rotateZ(${r}deg) scale(${s})`;

function Deck() {
  const [render, setRender] = useState(false);
  const [gone] = useState(() => new Set());
  const [objs, setObjs] = useState([]);

  const fetchData = async () => {
    fetch("http://localhost:8080/product/get")
      .then((response) => response.json())
      .then((data) => {
        setObjs(data);
        setRender(true);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [props, set] = useSprings(cards.length, (i) => ({
    ...to(i),
    from: from(i),
  }));

  const bind = useGesture(
    ({
      args: [index],
      down,
      delta: [xDelta],
      distance,
      direction: [xDir],
      velocity,
    }) => {
      const trigger = velocity > 0.2;
      const dir = xDir < 0 ? -1 : 1;

      if (!down && trigger) gone.add(index);

      set((i) => {
        if (index !== i) return;
        const isGone = gone.has(index);

        const x = isGone ? (200 + window.innerWidth) * dir : down ? xDelta : 0;

        const rot = xDelta / 100 + (isGone ? dir * 10 * velocity : 0);

        const scale = down ? 1.1 : 1;
        return {
          x,
          rot,
          scale,
          delay: undefined,
          config: { friction: 50, tension: down ? 800 : isGone ? 200 : 500 },
        };
      });

      if (!down && gone.size === cards.length)
        setTimeout(() => gone.clear() || set((i) => to(i)), 600);
    }
  );

  if (render) {
    return props.map(({ x, y, rot, scale }, i) => (
      <Card
        key={i}
        i={i}
        x={x}
        y={y}
        rot={rot}
        scale={scale}
        trans={trans}
        cards={cards}
        objs={objs}
        bind={bind}
      />
    ));
  } else {
    return <h1 id="loading">Loading...</h1>;
  }
}

export default Deck;
