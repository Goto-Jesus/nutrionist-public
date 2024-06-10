'use strict';
// import { useDynamicAdapt } from "./src/dynamicAdapt.js";
// import "./src/sectionObserver.js";

// =========================================================================

// Function to check if an element is in the viewport
function isElementInViewport(el) {
  var rect = el.getBoundingClientRect();
  return (
    rect.top + 50 <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0 &&
    rect.left >= 0 &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Function to handle scroll event
function handleScroll() {
  var sections = document.querySelectorAll("section");

  // Loop through each section and check if it's in the viewport
  sections.forEach(function (section) {
    if (isElementInViewport(section)) {
      // Get the id of the section
      var sectionId = section.getAttribute("id");

      // Update the URL with the section id as the anchor
      if (sectionId) history.replaceState(null, null, "#" + sectionId);
    }
  });
}

// Debounce function
function debounce(func, delay) {
  let timeoutId;
  return function () {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Add scroll event listener to window
window.addEventListener("scroll", debounce(handleScroll, 100));

// =========================================================================
export function useDynamicAdapt(type = "max") {
  const className = "_dynamic_adapt_";
  const attrName = "data-da";
  const dNodes = getDNodes();
  const dMediaQueries = getDMediaQueries(dNodes);

  dMediaQueries.forEach((dMediaQuery) => {
    const matchMedia = window.matchMedia(dMediaQuery.query);
    // массив объектов с подходящим брейкпоинтом
    const filteredDNodes = dNodes.filter(
      ({ breakpoint }) => breakpoint === dMediaQuery.breakpoint
    );
    const mediaHandler = getMediaHandler(matchMedia, filteredDNodes);
    matchMedia.addEventListener("change", mediaHandler);

    mediaHandler();
  });

  function getDNodes() {
    const result = [];
    const elements = [...document.querySelectorAll(`[${attrName}]`)];

    elements.forEach((element) => {
      const attr = element.getAttribute(attrName);
      const [toSelector, breakpoint, order] = attr
        .split(",")
        .map((val) => val.trim());

      const to = document.querySelector(toSelector);

      if (to) {
        result.push({
          parent: element.parentElement,
          element,
          to,
          breakpoint: breakpoint ?? "767",
          order:
            order !== undefined
              ? isNumber(order)
                ? Number(order)
                : order
              : "last",
          index: -1,
        });
      }
    });

    return sortDNodes(result);
  }

  function getDMediaQueries(items) {
    const uniqItems = [
      ...new Set(
        items.map(
          ({ breakpoint }) => `(${type}-width: ${breakpoint}px),${breakpoint}`
        )
      ),
    ];

    return uniqItems.map((item) => {
      const [query, breakpoint] = item.split(",");

      return { query, breakpoint };
    });
  }

  function getMediaHandler(matchMedia, items) {
    return function mediaHandler() {
      if (matchMedia.matches) {
        items.forEach((item) => {
          moveTo(item);
        });

        items.reverse();
      } else {
        items.forEach((item) => {
          if (item.element.classList.contains(className)) {
            moveBack(item);
          }
        });

        items.reverse();
      }
    };
  }

  function moveTo(dNode) {
    const { to, element, order } = dNode;
    dNode.index = getIndexInParent(dNode.element, dNode.element.parentElement);
    element.classList.add(className);

    if (order === "last" || order >= to.children.length) {
      to.append(element);

      return;
    }

    if (order === "first") {
      to.prepend(element);

      return;
    }

    to.children[order].before(element);
  }

  function moveBack(dNode) {
    const { parent, element, index } = dNode;
    element.classList.remove(className);

    if (index >= 0 && parent.children[index]) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }

  function getIndexInParent(element, parent) {
    return [...parent.children].indexOf(element);
  }

  function sortDNodes(items) {
    const isMin = type === "min" ? 1 : 0;

    return [...items].sort((a, b) => {
      if (a.breakpoint === b.breakpoint) {
        if (a.order === b.order) {
          return 0;
        }

        if (a.order === "first" || b.order === "last") {
          return -1 * isMin;
        }

        if (a.order === "last" || b.order === "first") {
          return 1 * isMin;
        }

        return 0;
      }

      return (a.breakpoint - b.breakpoint) * isMin;
    });
  }

  function isNumber(value) {
    return !isNaN(value);
  }
}

useDynamicAdapt();
// =========================================================================

const breakpoints = {
  desktop: 1400, // ↓ max   Desktop   ↑ min
  labtop: 1200, // ↓ max   Labtop    ↑ min
  tablet: 992, // ↓ max   Tablet    ↑ min
  phablet: 768, // ↓ max   Phablet   ↑ min
  phone: 576, // ↓ max   Phone     ↑ min
};

const mySlider = new Splide("#my-slider", {
  type: "loop",
  perPage: 2,
  gap: "24px",
  autoplay: true,
  breakpoints: {
    [breakpoints.phablet]: {
      perPage: 1,
    },
  },
});

mySlider.mount();

const mySlider2 = new Splide("#my-slider-2", {
  type: "loop",
  perPage: 2,
  gap: "44px",
  autoplay: true,
  breakpoints: {
    [breakpoints.labtop]: {
      perPage: 1,
    },
  },
});

mySlider2.mount();


// =========================================================================
// const countAnimation = (number = 10, duration = 5000) => {
//   return {
//     currentCount: "0",
//     targetCount: Number(number),
//     duration,
//     observer: null,
//     startAnimation() {
//       let startTime = null;
//       const updateCount = (timestamp) => {
//         if (!startTime) startTime = timestamp;
//         const elapsed = timestamp - startTime;
//         this.currentCount = Math.min(
//           Math.floor((elapsed / this.duration) * this.targetCount),
//           this.targetCount
//         );
//         if (elapsed < this.duration) {
//           window.requestAnimationFrame(updateCount);
//         }
//       };
//       window.requestAnimationFrame(updateCount);
//     },
//   };
// };

// document.addEventListener("alpine:init", () => {
//   console.log("hi");
//   Alpine.data("countAnimation", countAnimation);
//   console.log(Alpine);
// });

// =========================================================================
const animItems = document.querySelectorAll("._anim-items");

console.log(animItems);

if (animItems.length > 0) {
  window.addEventListener("scroll", animOnScroll);

  function animOnScroll() {
    for (let index = 0; index < animItems.length; index++) {
      const animItem = animItems[index];
      const animItemHeight = animItem.offsetHeight; // Исправлено здесь
      const animItemOffset = offset(animItem).top;
      const animStart = 2;

      let animItemPoint = window.innerHeight - animItemHeight / animStart;
      if (animItemHeight > window.innerHeight) {
        animItemPoint = window.innerHeight - window.innerHeight / animStart;
      }

      if (
        window.scrollY > animItemOffset - animItemPoint &&
        window.scrollY < animItemOffset + animItemHeight
      ) {
        animItem.classList.add("_anim-active");
      } else {
        if (!animItem.classList.contains("_anim-once")) {
          animItem.classList.remove("_anim-active");
        }
      }
    }
  }

  function offset(el) {
    const rect = el.getBoundingClientRect(),
      scrollLeft = window.scrollX || document.documentElement.scrollLeft,
      scrollTop = window.scrollY || document.documentElement.scrollTop; // Исправлено здесь
    return { top: rect.top + scrollTop, left: rect.left + scrollLeft };
  }

  setTimeout(() => {
    animOnScroll();
  }, 500);
}
