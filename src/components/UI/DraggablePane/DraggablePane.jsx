import React, { useEffect, useState, useRef } from 'react';

import { useSpring, animated } from 'react-spring'
import { useGesture } from 'react-use-gesture'

import './DraggablePane.css';

const DraggablePane = ({ onHide = false, onOpen = false, open = false, children, className, style }) => {
	const [ heightWithoutDrag, setHeightWithoutDrag ] = useState(0);

	const elementRef = useRef(null);

	const [startDragScrollOffsetY,setStartDragScrollOffsetY] = useState(0);

	const [safeAreaTop,setSafeAreaTop] = useState(0);
	const [safeAreaBottom,setSafeAreaBottom] = useState(0);

	const [windowWidth,setWindowWidth] = useState(window.innerWidth);

	const [{ y, height }, set] = useSpring(() => ({ y: 0, height: heightWithoutDrag }))

	const handleResize = () => {
		setWindowWidth(window.innerWidth);
	};

	useEffect(() => {
		window.addEventListener("resize", handleResize);
		handleResize();
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	},[]);

	useEffect(() => {
		try {
			let computedSafeAreaTop = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safeAreaTop"));
			let computedSafeAreaBottom = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--safeAreaBottom"));
			setSafeAreaTop(isNaN(computedSafeAreaTop) ? 10 : computedSafeAreaTop);
			setSafeAreaBottom(isNaN(computedSafeAreaBottom) ? 10 : computedSafeAreaBottom);
		}
		catch(exception) {
			console.log('Error parsing safeAreaBottom value in DraggablePane');
			safeAreaTop(0);
			setSafeAreaBottom(0);
		}

		if (open) {
			setHeightWithoutDrag(window.innerHeight - (safeAreaTop ? safeAreaTop : 24));
		}
		else {
			if (window.innerWidth < 670) {
				setHeightWithoutDrag(60);
			}
			else {
				setHeightWithoutDrag(90);
			}
		}
	},[open,windowWidth]);

	useEffect(() => {
		// Giving it a little time before calling, to prevent it being triggered before mouseup, otherwise we get weird sideeffects.
		setTimeout(() => {
			set({ height: heightWithoutDrag });
		},50);
	},[heightWithoutDrag]);

	const bind = useGesture({
		onDragStart: (event) => {
			// We don't want the user dragging the player if there's a modal showing
			if (event._dragTarget && event._dragTarget.tagName && (event._dragTarget.tagName.toLowerCase() == 'ion-modal' || event._dragTarget.tagName.toLowerCase() == 'ion-backdrop')) {
				return;
			}
			setStartDragScrollOffsetY(elementRef.current.scrollTop);
			// elementRef.current.scrollTop = startDragScrollOffsetY;
		},
		onDrag: ({ event, down, initial: [ix,iy], movement: [mx, my], direction: velocity }) => {
			// We don't want the user dragging the player if there's a modal showing
			if (event && event.target && event.target.tagName && event.target.tagName.toLowerCase() == 'ion-modal') {
				return;
			}

			let dragValues = { height: heightWithoutDrag };
			
			if (my === 0) {
				return;
			}

			if (elementRef.current) {
				if (open && (elementRef.current.scrollTop > 0 || my < 0)) {
					const canScrollDown = true;

					// if (down && canScrollDown) {
						elementRef.current.scrollTop = startDragScrollOffsetY + (my * -1);
						dragValues.y = startDragScrollOffsetY + (my * -1) + 2;
						set(dragValues);
					// }
				}
				else {
					dragValues = { height: down ? heightWithoutDrag - my : heightWithoutDrag };
					if (open && my > 100 && !down) {
						if (onHide) {
							onHide();
						}
					}
					else if (!open && !down) {
						if (my < -60) {
							if (onOpen) {
								onOpen();
							}
						}
					}
					set(dragValues);
				}
			}
		}
	})
// <animated.div className={className} {...bind()} style={{ bottom: (open ? y : 0), touchAction: 'none', ...style }}>

	let bottomValue = open ? 0 : window.innerWidth < 900 ? (71 + safeAreaBottom) : 0;

	let scrollTop = elementRef?.current?.scrollTop;

	let dragStyle = {
		...style,
		bottom: bottomValue,
		touchAction: (scrollTop === 0 ? 'none' : 'auto'),
		height: height,
		y
	};


	return (
		<animated.div className={className} {...bind()} style={dragStyle} ref={elementRef}>
			{ open && 
				<div className='dragHandle'>&nbsp;</div>
			}
			{children}
		</animated.div>
	);
};
export default DraggablePane;