/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import {connect} from "react-redux";
import PlotlyChart, {IPlotlyChartProps} from "react-plotlyjs-ts";
import {State} from "../types/redux/state";
import {calculateScaleFromEndpoints, GPSPoint} from "../utils/calibration";

function mapStateToProps(state: State) {
	let map;
	if (state.maps.selectedMap != 0) {
		const mapID = state.maps.selectedMap;
		if (state.maps.byMapID[mapID]) {
			map = state.maps.byMapID[mapID];
			if (state.maps.editedMaps[mapID]) {
				map = state.maps.editedMaps[mapID];
			}
		}
	}
	// set map background image
	let image = (map)? map.image : new Image();
	const data: any[] = [];
	const layout: any = {
		title: {
			text: (map)? map.name : 'There\'s not an available map',
		},
		width: 1000,
		height: 1000,
		xaxis: {
			visible: false, // changes all visibility settings including showgrid, zeroline, showticklabels and hiding ticks
			range: [0, 500], // range of displayed graph
		},
		yaxis: {
			visible: false,
			range: [0, 500],
			scaleanchor:'x',
		},
		images: [{
			layer: 'below',
			source: image.src,
			xref: 'x',
			yref: 'y',
			x: 0,
			y: 0,
			sizex: 500,
			sizey: 500,
			xanchor: 'left',
			yanchor: 'bottom',
			sizing: 'contain',
			opacity: 1,
		}],
	};

	// calculate coordinates
	let x: number[] = [];
	let y: number[] = [];
	let texts: string[] = [];
	if (map && map.origin && map.opposite) {
		/**
		 * todo: replace with automatic code
		 */
		const points: any[] = [];
		for (const meterID of state.graph.selectedMeters) {
			console.log(state.meters.selectedMeters);
			console.log(state.graph.selectedMeters);
			console.log(state.meters.byMeterID);
			const byMeterID = state.readings.line.byMeterID[meterID];
			const gps = state.meters.byMeterID[meterID].gps;
			if (gps !== undefined && gps !== null) {
				points.push(gps);
			}
		}
		texts = ['Maurer: 6', 'Aldrich: 60'];

		const origin = map.origin;
		const opposite = map.opposite;
		const mapScale = calculateScaleFromEndpoints(origin, opposite, {
			width: image.width,
			height: image.height
		});
		// map coordinates to individual traces, todo: finalize mapping function
		x = points.map(point => (point.longitude - origin.longitude) / mapScale.degreePerUnitX);
		y = points.map(point => (point.latitude - origin.latitude) / mapScale.degreePerUnitY);

		const trace1 = {
			x: x,
			y: y,
			type: 'scatter',
			mode: 'markers',
			marker: {
				color: 'rgb(44,183,19)',
				opacity: 0.5,
				size: [6, 60],
			},
			text: texts,
			opacity: 1,
			showlegend: false
		};
		data.push(trace1);
	}
	/***
	 * Usage:
	 *  <PlotlyChart data={toJS(this.model_data)}
	 *               layout={layout}
	 *               onClick={({points, event}) => console.log(points, event)}>
	 */
	const props: IPlotlyChartProps = {
		data: data,
		layout: layout,
	}
	return props;
}

export default connect(mapStateToProps)(PlotlyChart);