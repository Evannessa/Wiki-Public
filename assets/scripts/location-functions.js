export class LocationHelpers {
    /**
     * get the connections from the element's dataset as string, return them as array
     * @param {SVGElement} locationEl - the place whose connections we want to return
     * @returns - get the connections from the dataset as string, return them as array
     */
    static returnConnectionsAsArray(locationData) {
        if (locationData.connections)
            return location.connections
        else
            return []
    }
    /**
     * Get the existing connected elements from this site or area
     * @param {place} locationEl - a site or area
     */
    static returnConnectedElements(locationData) {
        let connections = locationData.connections
        return connections.map((connection) => {
            return document.querySelector(`[data-guid='${connection}']`)
        }).filter((el) => el !== undefined && el !== null)
    }

    // static returnChildLocations(locationData, chidren) {
    //     const { id: name, type } = locationData;
    //     let childType = LocationHelpers.getChildType(type)
    //     let childLocations = LocationHelpers.filterChildLocations(name, childType, locationData)
    //     return childLocations
    // }


    // static filterChildLocations(parentName, type, locationData) {
    //     return locationData[`${type}s`].filter(item => item.parent == parentName)
    // }
    static getChildType(parentType) {
        let childType = ""
        switch (parentType) {
            case "region":
                childType = "area"
                break;
            case "area":
                childType = "site"
                break;
            default:
                childType = "region"
                break;
        }
        return childType
    }

}
