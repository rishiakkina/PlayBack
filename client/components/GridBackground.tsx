import React from "react";
 
export function GridBackgroundDemo(props: React.PropsWithChildren<{}>) {
  return (
    <div className="relative flex h-[35rem] w-full items-center justify-center bg-white dark:bg-black">
      <div
        className="absolute inset-0 [background-size:30px_30px] [background-image:radial-gradient(#d4d4d4_1.5px,transparent_1px)] dark:[background-image:radial-gradient(#404040_3px,transparent_1px)]"
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)] dark:bg-black"></div>
      <div className="relative z-20 bg-gradient-to-b from-neutral-200 to-neutral-700 bg-clip-text py-8 text-4xl text-transparent sm:text-7xl">
      {props.children}
      </div>
    </div>
  );
}