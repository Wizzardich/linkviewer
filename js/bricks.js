function knot(object) {
   object.events = {};

   object.on = (name, handler) => {
      object.events[name] = object.events[name] || [];
      object.events[name].push(handler);
      return object;
   }

   object.once = (name, handler) => {
      handler._once = true;
      object.on(name, handler);
      return object;
   }

   object.off = function(name, handler) {
      arguments.length === 2
         ? object.events[name].splice(object.events[name].indexOf(handler), 1)
         : delete object.events[name];

      return object;
   }

   object.emit = function(name, ...args) {
      // cache event state, to avoid consequences of mutation from splice while firing handlers
      const cached = object.events[name] && object.events[name].slice();
      cached && cached.forEach(handler => {
         handler._once && object.off(name, handler);
         handler.apply(object, args);
      });

      return object;
   }

   return object;
};



function Bricks(options) {
   var persist;
   var ticking;   

   var sizeIndex;
   var sizeDetail;

   var columnHeights;

   var nodes;
   var nodesWidth;
   var nodesHeights;

   // options

   const container = document.querySelector(options.container);
   const packed    = options.packed.indexOf('data-') === 0 ? options.packed : `data-${ options.packed }`;
   const sizes     = options.sizes.reverse();

   const selectors = {
      all: `${ options.container } > *`,
      new: `${ options.container } > *:not([${ packed }])`
   }

   // series

   const setup = [
      setSizeIndex,
      setSizeDetail,
      setColumns
   ]

   const run = [
   setNodes,
   setNodesDimensions,
   setNodesStyles,
   setContainerStyles
   ]

   // instance

   const instance = knot({
      pack,
      update,
      resize
   })

   return instance;

   // general helpers

   function runSeries(functions) {
      functions.forEach(func => func());
   }

   // array helpers

   function toArray(selector) {
      return Array.prototype.slice.call(document.querySelectorAll(selector));
   }

   function fillArray(length) {
      return Array.apply(null, Array(length)).map(() => 0);
   }

   // size helpers

   function getSizeIndex() {
      // find index of widest matching media query
      return sizes
         .map(size => size.mq && window.matchMedia(`(min-width: ${ size.mq })`).matches)
         .indexOf(true);
   }

   function setSizeIndex() {
      sizeIndex = getSizeIndex();
   }

   function setSizeDetail() {
      // if no media queries matched, use the base case
      sizeDetail = sizeIndex === -1
         ? sizes[sizes.length - 1]
         : sizes[sizeIndex];
   }

   // column helpers

   function setColumns() {
      columnHeights = fillArray(sizeDetail.columns);
   }

   // node helpers

   function setNodes() {
      nodes = toArray(persist ? selectors.new : selectors.all);
   }

   function setNodesDimensions() {
      nodesWidth   = nodes[0].clientWidth;
      nodesHeights = nodes.map(element => element.clientHeight);
   }

   function setNodesStyles() {
      nodes.forEach((element, index) => {
         const target = columnHeights.indexOf(Math.min.apply(Math, columnHeights));

         element.style.position  = 'absolute';
         element.style.top       = `${ columnHeights[target] }px`;
         element.style.left      = `${ (target * nodesWidth) + (target * sizeDetail.gutter) }px`;

         element.setAttribute(packed, '');

         columnHeights[target] += nodesHeights[index] + sizeDetail.gutter;
      });
   }

   // container helpers

   function setContainerStyles() {
      container.style.position = 'relative';
      container.style.width    = `${ sizeDetail.columns * nodesWidth + (sizeDetail.columns - 1) * sizeDetail.gutter }px`;
      container.style.height   = `${ Math.max.apply(Math, columnHeights) - sizeDetail.gutter }px`;
   }

   // resize helpers

   function resizeFrame() {
      if(!ticking) {
         requestAnimationFrame(resizeHandler);
         ticking = true;
      }
   }

   function resizeHandler() {
      if(sizeIndex !== getSizeIndex()) {
         pack();
         instance.emit('resize', sizeDetail);
      }

      ticking = false;
   }

   // API

   function pack() {
      persist = false;
      runSeries(setup.concat(run));

      return instance.emit('pack');
   }

   function update() {
      persist = true;
      runSeries(run);

      return instance.emit('update');
   }

   function resize() {
      window.addEventListener('resize', resizeFrame);

      return instance;
   }
}
