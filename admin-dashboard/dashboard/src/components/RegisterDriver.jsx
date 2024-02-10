import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import contractArtifact from '../ABI/GeoLogixRefund.json';

const AdminDashboard = () => {
    const [driverAddress, setDriverAddress] = useState('');
    const [name, setName] = useState('');
    const [lat, setLat] = useState(0);
    const [lon, setLon] = useState(0);
    const [allowedDistance, setAllowedDistance] = useState(0);
    const [requiredTime, setRequiredTime] = useState(0);
    const [timeTolerance, setTimeTolerance] = useState(0);
    const [refundAmount, setRefundAmount] = useState(0);
    const [driverData, setDriverData] = useState({});
    const [actionResult, setActionResult] = useState('');
    const [loading, setLoading] = useState(false);

    const web3 = new Web3(window.ethereum); // Connect to Metamask
    const contractAddress = '0x5a03f9f1E215287a428D2e994B5C481944E3040F'; // Contract address
    const contractABI = contractArtifact.abi; // Get the ABI from the artifact
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    const registerDriver = async () => {
        setLoading(true);
        try {
            const accounts = await window.ethereum.enable();
            const account = accounts[0];
            // Call the registerDriver function from your smart contract
            await contract.methods.registerDriver(driverAddress, name, lat, lon, allowedDistance, requiredTime, timeTolerance, refundAmount).send({ from: account });
            console.log('Driver registered successfully!');
            // Fetch the driver data after the registration transaction has been confirmed
            await getDriverData(driverAddress);
            setActionResult('Driver registered successfully!');
        } catch (error) {
            console.error('Error registering driver:', error);
            setActionResult('Error registering driver: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const getDriverData = async (driverAddress) => {
        try {
            const data = await contract.methods.getDriver(driverAddress).call();
            console.log('Raw data from smart contract:', data);
            // Extract data from the returned tuple and format it
            const formattedData = {
                name: data[0] || '',
                lat: Number(data[1]) || '',
                lon: Number(data[2]) || '',
                allowedDistance: Number(data[3]) || '',
                requiredTime: Number(data[4]) || '',
                timeTolerance: Number(data[5]) || '',
                refundAmount: Number(data[6]) || '',
                rating: Number(data[7]) || '',
                tokens: Number(data[8]) || '',
                isInCompliance: Boolean(data[9]) || false
            };
            setDriverData(formattedData);
        } catch (error) {
            console.error('Error getting driver data:', error);
        }
    };    

    const removeDriver = async () => {
        setLoading(true);
        try {
            const accounts = await window.ethereum.enable();
            const account = accounts[0];
            await contract.methods.removeDriver(driverAddress).send({ from: account });
            console.log('Driver removed successfully!');
            setActionResult('Driver removed successfully!');
        } catch (error) {
            console.error('Error removing driver:', error);
            setActionResult('Error removing driver: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const updateDriver = async () => {
        setLoading(true);
        try {
            const accounts = await window.ethereum.enable();
            const account = accounts[0];
            await contract.methods.updateDriverInfo(driverAddress, lat, lon, allowedDistance, requiredTime, timeTolerance, refundAmount).send({ from: account });
            console.log('Driver updated successfully!');
            setActionResult('Driver updated successfully!');
            await getDriverData(driverAddress); // Fetch updated driver data after successful update
        } catch (error) {
            console.error('Error updating driver:', error);
            setActionResult('Error updating driver: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getDriverData(driverAddress);
    }, [driverAddress]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-6xl p-6 m-3 bg-white rounded shadow-md">
                <h1 className="text-3xl font-bold text-center mb-6">Admin Dashboard</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="text" placeholder="Driver Address" onChange={e => setDriverAddress(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="text" placeholder="Name" onChange={e => setName(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="number" placeholder="Latitude" onChange={e => setLat(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="number" placeholder="Longitude" onChange={e => setLon(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="number" placeholder="Allowed Distance" onChange={e => setAllowedDistance(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="number" placeholder="Required Time" onChange={e => setRequiredTime(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="number" placeholder="Time Tolerance" onChange={e => setTimeTolerance(e.target.value)} />
                    <input className="p-2 text-lg border rounded focus:outline-none focus:border-blue-400" type="number" placeholder="Refund Amount" onChange={e => setRefundAmount(e.target.value)} />
                </div>
                <div className="flex justify-center">
                    <button className="w-full px-4 py-2 mr-4 text-lg text-white bg-blue-500 rounded hover:bg-blue-700" onClick={registerDriver} disabled={loading}>Register Driver</button>
                    <button className="w-full px-4 py-2 mr-4 text-lg text-white bg-red-500 rounded hover:bg-red-700" onClick={removeDriver} disabled={loading}>Remove Driver</button>
                    <button className="w-full px-4 py-2 text-lg text-white bg-green-500 rounded hover:bg-green-700" onClick={updateDriver} disabled={loading}>Update Driver</button>
                </div>
                {actionResult && <p className="text-center mt-4 text-red-500">{actionResult}</p>}
            </div>

            <div className="w-full max-w-6xl p-6 m-3 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center mb-4">Driver Information</h2>
                <table className="w-full text-center border-collapse">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Latitude</th>
                            <th>Longitude</th>
                            <th>Allowed Distance</th>
                            <th>Required Time</th>
                            <th>Time Tolerance</th>
                            <th>Refund Amount</th>
                            <th>Rating</th>
                            <th>Tokens</th>
                            <th>Is In Compliance</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{driverData.name}</td>
                            <td>{driverData.lat}</td>
                            <td>{driverData.lon}</td>
                            <td>{driverData.allowedDistance}</td>
                            <td>{driverData.requiredTime}</td>
                            <td>{driverData.timeTolerance}</td>
                            <td>{driverData.refundAmount}</td>
                            <td>{driverData.rating}</td>
                            <td>{driverData.tokens}</td>
                            <td>{driverData.isInCompliance ? 'Yes' : 'No'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
