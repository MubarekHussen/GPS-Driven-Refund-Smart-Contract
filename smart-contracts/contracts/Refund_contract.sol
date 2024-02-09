// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "./ECR20.sol";

contract GeoLogixRefund {
    address owner;
    YourERC20Token token;
    struct Driver {
        string name;
        uint256 lat;
        uint256 lon;
        uint256 allowedDistance;
        uint256 requiredTime;
        uint256 timeTolerance;
        uint256 refundAmount;
        uint256 rating;
        uint256 tokens;
        bool isRegistered;
        bool isInCompliance;
    }
    mapping(address => Driver) public drivers;
    address[] public driverAddresses;
    event DriverRegistered(address driverAddress);
    event CoordinateIngested(address driverAddress, uint256 lat, uint256 lon, uint256 timestamp);
    event ComplianceStatusChanged(address driverAddress, bool isInCompliance);
    constructor(address initialAddress) {
        owner = msg.sender;
        token = new YourERC20Token(initialAddress);
    }
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }
    function registerDriver(address driverAddress, string memory name, uint256 lat, uint256 lon, uint256 allowedDistance, uint256 requiredTime, uint256 timeTolerance, uint256 refundAmount) public onlyOwner {
        require(!drivers[driverAddress].isRegistered, "Driver is already registered");
        drivers[driverAddress] = Driver(name, lat, lon, allowedDistance, requiredTime, timeTolerance, refundAmount, 0, 0, true, false);
        driverAddresses.push(driverAddress);
        emit DriverRegistered(driverAddress);
    }
    function updateDriverInfo(address driverAddress, uint256 newLat, uint256 newLon, uint256 newAllowedDistance, uint256 newRequiredTime, uint256 newTimeTolerance, uint256 newRefundAmount) public onlyOwner {
        require(drivers[driverAddress].isRegistered, "Driver is not registered");
        drivers[driverAddress].lat = newLat;
        drivers[driverAddress].lon = newLon;
        drivers[driverAddress].allowedDistance = newAllowedDistance;
        drivers[driverAddress].requiredTime = newRequiredTime;
        drivers[driverAddress].timeTolerance = newTimeTolerance;
        drivers[driverAddress].refundAmount = newRefundAmount;
    }
    function ingestCoordinate(uint256 lat, uint256 lon, uint256 timestamp) public {
        address driverAddress = msg.sender;
        require(drivers[driverAddress].isRegistered, "Driver is not registered");
        uint256 distance = calculateDistance(lat, lon, driverAddress);
        bool oldComplianceStatus = drivers[driverAddress].isInCompliance;
        if (distance > drivers[driverAddress].allowedDistance || timestamp < drivers[driverAddress].requiredTime || timestamp > drivers[driverAddress].requiredTime + drivers[driverAddress].timeTolerance) {
            drivers[driverAddress].isInCompliance = false;
        } else {
            drivers[driverAddress].isInCompliance = true;
        }
        if (oldComplianceStatus != drivers[driverAddress].isInCompliance) {
            emit ComplianceStatusChanged(driverAddress, drivers[driverAddress].isInCompliance);
        }
        emit CoordinateIngested(driverAddress, lat, lon, timestamp);
        // Update driver's rating based on their compliance
        if (drivers[driverAddress].isInCompliance) {
            drivers[driverAddress].rating += 1;
        } else {
            if (drivers[driverAddress].rating > 0) {
                drivers[driverAddress].rating -= 1;
            }
        }
    }
    function getDriver(address driverAddress) public view returns (string memory, uint256, uint256, uint256, uint256, uint256, uint256, uint256, uint256, bool) {
        Driver memory driver = drivers[driverAddress];
        require(driver.isRegistered, "Driver is not registered");
        return (driver.name, driver.lat, driver.lon, driver.allowedDistance, driver.requiredTime, driver.timeTolerance, driver.refundAmount, driver.rating, driver.tokens, driver.isInCompliance);
    }
    function refund(address driverAddress) public onlyOwner payable {
        require(drivers[driverAddress].isRegistered, "Driver is not registered");
        require(drivers[driverAddress].isInCompliance, "Driver is not in compliance");
        payable(driverAddress).transfer(drivers[driverAddress].refundAmount);
    }
    function reward(address driverAddress) public onlyOwner payable {
        require(drivers[driverAddress].isRegistered, "Driver is not registered");
        require(drivers[driverAddress].isInCompliance, "Driver is not in compliance");
        // Reward driver with tokens based on their rating
        uint256 rewardAmount = drivers[driverAddress].rating * 2; // Modify this as per your business logic
        token.transfer(driverAddress, rewardAmount);
        drivers[driverAddress].tokens += rewardAmount;
    }
    function abs(int256 x) internal pure returns (uint256) {
        return x >= 0 ? uint256(x) : uint256(-x);
    }
    function calculateDistance(uint256 lat2, uint256 lon2, address driverAddress) internal view returns (uint256) {
        (,uint256 lat1, uint256 lon1,,,,,,,) = getDriver(driverAddress);
        uint256 distance = abs(int256(lat2) - int256(lat1)) + abs(int256(lon2) - int256(lon1));
        require(distance <= type(uint256).max, "Distance calculation overflow");
        return distance;
    }
}