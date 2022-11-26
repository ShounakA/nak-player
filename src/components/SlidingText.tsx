import React, { useState, useEffect, createRef } from 'react';

interface SlidingTextProps {
	text: string;
	textStyles: string;
}

function SlidingText(props: SlidingTextProps) {
	const text = props.text ?? '';
	const inputRef = createRef() as React.RefObject<HTMLInputElement>;
	useEffect(() => {
		const scrollAnimation = (inputElement: HTMLInputElement) => {
			const interval = setInterval(() => {
				if (inputElement) {
					if (
						inputElement.scrollLeft <=
						inputElement.scrollWidth - inputElement.offsetWidth + 3
					) {
						inputElement.scrollLeft += 1;
					} else {
						clearInterval(interval);
						setTimeout(() => {
							inputElement.scrollLeft = 0;
						}, 600);
					}
				}
			}, 300);
		};
		const inputElement = inputRef?.current;
		if (inputElement) scrollAnimation(inputElement);
	});
	return (
		<div className="dark:text-light w-30 whitespace-nowrap">
			<input
				ref={inputRef}
				className={props.textStyles}
				type="text"
				value={text}
				readOnly
			/>
		</div>
	);
}

export default SlidingText;
