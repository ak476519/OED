/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const express = require('express');
const Map = require('../models/Map');
const { log } = require('../log');
const validate = require('jsonschema').validate;
const { getConnection } = require('../db');
const requiredAuthenticator = require('./authenticator').authMiddleware;
const optionalAuthenticator = require('./authenticator').optionalAuthMiddleware;
const moment = require('moment');
const Point = require('../models/Point');
const router = express.Router();

function formatMapForResponse(map) {
	const formattedMap = {
		id: map.id,
		name: map.name,
		note: map.note,
		fileName: map.fileName,
		modifiedDate: map.modifiedDate,
		origin: map.origin,
		opposite: map.opposite,
		mapSource: map.mapSource,
	};
	return formattedMap;
}

router.get('/', async (req, res) => {
	const conn = getConnection();
	let query;
	if (req.hasValidAuthToken) {
		query = Meter.getAll; // only logged in users can see disabled maps;
	} else {
		query = Meter.getDisplayable;
	}
	try {
		const rows = await query(conn);
		res.json(rows.map(row => formatMapForResponse(row)));
	} catch (err) {
		log.error(`Error while performing GET all maps query: ${err}`, err);
	}
});

router.get('/:map_id', async (req, res) => {
	const validParams = {
		type: 'object',
		maxProperties: 1,
		required: ['map_id'],
		properties: {
			map_id: {
				type: 'string',
				pattern: '^\\d+$'
			}
		}
	};
	if (!validate(req.params, validParams).valid) {
		res.sendStatus(400);
	} else {
		const conn = getConnection();
		try {
			const map = await Map.getByID(req.params.map_id, conn);
			res.json(formatMapForResponse(map));
		} catch (err) {
			log.error(`Error while performing GET specific map by id query: ${err}`, err);
			res.sendStatus(500);
		}
	}
});

router.post('/create', async (req, res) => {
	const validGroup = {
		type: 'object',
		maxProperties: 7,
		required: ['name', 'mapSource'],
		properties: {
			name: {
				type: 'string',
				minLength: 1
			},
			note: {
				type: 'string',
				minLength: 0
			},
			filename: {
				type: 'string',
			},
			modifiedDate: {
				type: 'string',
			},
			mapSource: {
				type: 'string',
			}
		}
	};

	if (!validate(req.body, validGroup).valid) {
		log.error(`Invalid input for mapAPI.`)
		res.sendStatus(400);
	} else {
		const conn = getConnection();
		try {
			await conn.tx(async t => {
				const origin = (req.body.origin)? new Point(req.body.origin.longitude, req.body.origin.latitude): new Point(1.000001,1.000001);
				const opposite = (req.body.opposite)? new Point(req.body.opposite.longitude, req.body.opposite.latitude): new Point(180.000001,180.000001);
				const newMap = new Map(
					undefined,
					req.body.name,
					false,
					undefined,
					"default",
					req.body.modifiedDate,
					origin,
					opposite,
					req.body.mapSource
				);
				await newMap.insert(t);
			});
			res.sendStatus(200);
		} catch (err) {
			if (err.toString() === 'error: duplicate key value violates unique constraint "maps_name_key"') {
				res.status(400).json({error: `Map "${req.body.name}" is already in use.`});
			} else {
				log.error(`Error while inserting new map ${err}`, err);
				res.sendStatus(500);
			}
		}
	}
});

module.exports = router;