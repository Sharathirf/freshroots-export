# FreshRoots Export: Shipment & Logistics Tracking Guide

## 1. Multi-Shipment Architecture
An order can be dispatched as a single parcel or split across multiple consignments. Each consignment is tracked via the `shipments` table, linked by `order_id` and `customer_id`.

## 2. Supported Logistics Modes & Carriers
- **Courier Express (Small Retail Parcels)**:
  - Shiprocket (Surface Express)
  - Delhivery Surface
  - BlueDart Express
  - DTDC Express
- **Bulk Road Freight (Truckloads & Part-Truckloads)**:
  - VRL Logistics (PTL / Mandi distribution)
  - TCI Freight (Dedicated FTL)
  - Direct Farm Gate Fleet (Local agricultural transit)

## 3. Shipment Data Fields
- `shipment_number`: Unique shipment code (e.g. `SHP-20261021-2117-101`)
- `delivery_partner`: Carrier name
- `shipment_type`: `courier`, `truckload`, `part_truckload`, `air_cargo`
- `tracking_number`: Carrier AWB or Consignment Reference
- `tracking_url`: Live tracking link
- `status`: `created`, `awaiting_pickup`, `picked_up`, `in_transit`, `out_for_delivery`, `delivered`, `delayed`, `failed_attempt`, `returned`, `cancelled`
- `vehicle_number`, `driver_name`, `driver_phone`, `lr_number`: For road freight
- `estimated_delivery_date`: Estimated delivery date
- `actual_delivery_date`: Verified delivery date timestamp
- `delivered_to_name`, `pod_reference`: Proof of delivery

## 4. Customer Tracking Experience
Customers can track shipments at `/track-order` by entering their Order Number (e.g. `AGR-20261021-2117`), Tracking Reference, or 10-digit mobile number. The page displays the visual stepper, transporter details, live carrier tracking link, vehicle/driver info, and full chronological milestone history.
