const service = require("./tables.service");
const asyncErrorBoundary = require("../errors/asyncErrorBoundary");

function hasData(req, res, next) {
    if (req.body.data) {
        res.locals.data = req.body.data;
        return next();
    }
    next({
        status: 400,
        message: "Body is missing a data property"
    });
}

function validateData(req, res, next) {
    const data = res.locals.data;
    const errors = [];
    if (!data.table_name || data.table_name.length < 2) {
        errors.push("Request body is missing a 'table_name' key.")
    }
    if (!data.capacity || data.capacity === 0 || typeof data.capacity !== "number") {
        errors.push("Request body is missing a 'capacity' key.")
    }
    if (errors.length === 0) {
        return next();
    }
    next({
        status: 400,
        message: `${errors.join("; ")}`
    });
}

async function tableExists(req, res, next) {
    const id = req.params.table_id;
    const foundTable = await service.read(id);
    if (foundTable) {
        res.locals.table = foundTable;
        return next();
    }
    next({
        status: 404,
        message: `Table with id: ${id} not found.`
    });
}

async function reservationExists(req, res, next) {
    const data = res.locals.data;
    const id = data.reservation_id;
    if (id === undefined) {
        return next({
            status: 400,
            message: "Request is missing a 'reservation_id' key."
        });
    }
    const foundRes = await service.readReservation(id);
    if (foundRes) {
        res.locals.reservation = foundRes;
        return next();
    }
    next({
        status: 404,
        message: `Reservation with id: ${id} does not exist.`
    });
}

function reservationIsSeated(req, res, next) {
    const reservation = res.locals.reservation;
    if (reservation.status !== "seated") {
        return next();
    }
    next({
        status: 400,
        message: "Reservation is already seated"
    });
}

function tableFitsReservation(req, res, next) {
    const table = res.locals.table;
    const reservation = res.locals.reservation;
    if (table.capacity >= reservation.people) {
        return next();
    }
    next({
        status: 400,
        message: "Table does not have sufficient capacity"
    });
}

function tableIsFree(req, res, next) {
    const table = res.locals.table;
    if (table.status !== "Occupied") {
        return next();
    }
    next({
        status: 400,
        message: "Table is already occupied"
    });
}

function tableIsOccupied(req, res, next) {
    const table = res.locals.table;
    if (table.status === "Occupied") {
        return next();
    } else {
        next({
            status: 400,
            message: "Table is not occupied."
        });
    }

}

async function create(req, res) {
    const tableData = res.locals.data;
    const newTable = await service.create(tableData);
    res.status(201).json({ data: newTable[0] });
}

async function list(req, res) {
    const tables = await service.list();
    res.json({ data: tables });
}

async function update(req, res) {
    const table = res.locals.table;
    const reservation = res.locals.reservation;
    await service.update(table.table_id, reservation.reservation_id);
    await service.updateReservation(reservation.reservation_id, "seated");
    res.json({});
}

async function destroy(req, res) {
    const table = res.locals.table;
    await service.updateReservation(table.reservation_id, "finished");
    await service.delete(table.table_id);
    res.status(200).json({});
}

module.exports = {
    create: [hasData, validateData, asyncErrorBoundary(create)],
    list: asyncErrorBoundary(list),
    update: [
        hasData,
        asyncErrorBoundary(tableExists),
        asyncErrorBoundary(reservationExists),
        tableFitsReservation,
        tableIsFree,
        reservationIsSeated,
        asyncErrorBoundary(update)
    ],
    delete: [
        asyncErrorBoundary(tableExists),
        tableIsOccupied,
        asyncErrorBoundary(destroy)
    ]
}