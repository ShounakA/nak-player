import React, { useState, useEffect, createRef } from 'react';
import Marquee from 'react-fast-marquee';

interface SlidingTextProps {
	text: string;
	textStyles: string;
	speed: number;
}

function SlidingText(props: SlidingTextProps) {
	const text = props.text ?? '';
	return (
		<Marquee
			className="dark:text-light w-25"
			gradientWidth={0}
			pauseOnClick
			speed={props.speed ?? 25}
		>
			<div className={props.textStyles}>{` ${text} `}</div>
		</Marquee>
	);
}

export default SlidingText;
