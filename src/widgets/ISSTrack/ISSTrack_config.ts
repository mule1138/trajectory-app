export const config = {
    "url": "https://api.wheretheiss.at",
    "units": "kilometers",
    "update_interval": 10,
    "endpoints": {
        "position": "v1/satellites/25544",
        "positions": "v1/satellites/25544/positions"
    },
    symbols: {
        observedPoint: {
            type: "point-3d",
            symbolLayers: [
                {
                    type: "object",
                    height: 10,
                    width: 10,
                    depth: 10,
                    resource: {
                        primitive: "sphere"
                    },
                    material: {
                        color: "green"
                    }
                }
            ]
        },
        "currentPoint": {
            "type": "point-3d",
            "symbolLayers": [{
                "type": "icon",
                "size": 10,
                "resource": {"primitive": "kite"},
                "material": {"color": "green"}
            }]
        }
    }
}