import React from 'react';
import MCPConnectors from './MCPConnectors';
import ChatInterface from './ChatInterface';
import './NullclawMissionControl.css';

const NullclawMissionControl = () => {
    return (
        <div className="mission-control">
            <h1>Mission Control</h1>
            <MCPConnectors />
            <ChatInterface />
        </div>
    );
};

export default NullclawMissionControl;