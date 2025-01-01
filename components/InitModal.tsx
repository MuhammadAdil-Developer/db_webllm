import React, { useState } from 'react';


import { useChatStore } from '@/store/chat';

function InitItem(props: { content: string; isError: boolean }) {
  return (
    <>
      <li className={`py-1 ${props.isError ? 'text-error' : ''}`}>
        {props.content}
      </li>
    </>
  );
}

export function InitModal() {
  const [initInfoTmp] = useChatStore((state) => [state.initInfoTmp]);

  const chatStore = useChatStore();
  return (
    <>
      <div className={`modal ${initInfoTmp.showModal ? 'modal-open' : ''}`}>
        <div className="modal-box w-11/12 max-w-5xl">
          {initInfoTmp.initMsg.findIndex((msg) => msg.isError) !== -1 && (
            <label
              htmlFor="my-modal-3"
              className="btn btn-sm btn-circle absolute right-2 top-2"
              onClick={() => chatStore.toggleInitModal(false)}
            >
              ✕
            </label>
          )}
          <h3 className="font-bold text-lg">Initializing Database Connection...</h3>
          <ul>
            {initInfoTmp.initMsg.map((msg) => (
              <InitItem
                content={msg.content}
                isError={!!msg.isError}
                key={msg.id}
              />
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export function InstructionModal() {
  const [instructionModalStatus] = useChatStore((state) => [
    state.instructionModalStatus,
  ]);
  const chatStore = useChatStore();

  const [dbType, setDbType] = useState('');
  const [connectionURL, setConnectionURL] = useState('');
  const [databaseName, setDatabaseName] = useState(''); // New state for database name
  const [collectionName, setCollectionName] = useState('');
  const [responseMessage, setResponseMessage] = useState('');
  const [responseError, setResponseError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [touched, setTouched] = useState({
    dbType: false,
    connectionURL: false,
    databaseName: false, // Added for new field
    collectionName: false
  });

  const [errors, setErrors] = useState({
    dbType: '',
    connectionURL: '',
    databaseName: '', // Added for new field
    collectionName: ''
  });

  const validateFields = () => {
    const newErrors = {
      dbType: !dbType ? 'Database type is required' : '',
      connectionURL: !connectionURL ? 'Connection URL is required' : '',
      databaseName: dbType === 'MongoDB' && !databaseName ? 'Database name is required' : '',
      collectionName: dbType === 'MongoDB' && !collectionName ? 'Collection name is required' : ''
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleDbTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDbType(e.target.value);
    if (e.target.value !== 'MongoDB') {
      setDatabaseName(''); // Reset database name
      setCollectionName('');
    }
    setTouched(prev => ({ ...prev, dbType: true }));
  };

  const handleConnectionURLChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConnectionURL(e.target.value);
    setTouched(prev => ({ ...prev, connectionURL: true }));
  };

  const handleDatabaseNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatabaseName(e.target.value);
    setTouched(prev => ({ ...prev, databaseName: true }));
  };

  const handleCollectionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCollectionName(e.target.value);
    setTouched(prev => ({ ...prev, collectionName: true }));
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async () => {
    setTouched({
      dbType: true,
      connectionURL: true,
      databaseName: true,
      collectionName: true,
    });
  
    if (!validateFields()) {
      return;
    }
  
    setIsLoading(true); // Start loading
  
    const payload: Record<string, string> = {
      database_uri: connectionURL,
      db_type: dbType === 'SQLDB' ? 'sql' : 'nosql',
    };
  
    if (dbType === 'MongoDB') {
      payload.db_name = databaseName;
      payload.collection_name = collectionName;
    }
  
    try {
      const response = await fetch('http://127.0.0.1:8000/connect-db', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      const data = await response.json();
      if (response.ok) {
        setResponseMessage(data.message || 'Successfully connected!');
        setResponseError('');
      } else {
        const errorMessage =
          typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail);
        setResponseError(errorMessage || 'Failed to connect.');
        setResponseMessage('');
      }
    } catch (error) {
      setResponseError('An error occurred while connecting.');
      setResponseMessage('');
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  
  

  const getExampleConnectionURL = () => {
    if (dbType === 'SQLDB') {
      return 'postgresql://Username:Password@IPAdress/mydrivers_dev';
    } else if (dbType === 'MongoDB') {
      return 'mongodb://IPAdress:Port/';
    }
    return 'mysql://Username:Password@IPAdress/mydatabase';
  };
    
  return (
    <>
      <div className={`modal ${instructionModalStatus ? 'modal-open' : ''}`}>
        <div className="modal-box w-11/12 max-w-5xl">
          <h3 className="font-bold text-lg">Database Configuration</h3>
          <p className="py-4">Please provide the details to connect to your database.</p>

          <div className="py-2">
            <label className="block font-bold mb-2">Select Database Type:</label>
            <select
              className={`select select-bordered w-full ${touched.dbType && errors.dbType ? 'border-red-500' : ''}`}
              value={dbType}
              onChange={handleDbTypeChange}
              onBlur={() => handleBlur('dbType')}
            >
              <option value="">Select...</option>
              <option value="SQLDB">SQLDB</option>
              <option value="MongoDB">MongoDB</option>
            </select>
            {touched.dbType && errors.dbType && (
              <p className="mt-1 text-red-500 text-sm">{errors.dbType}</p>
            )}
          </div>

          <div className="py-2 relative">
        <label className="block font-bold mb-2">Connection URL:</label>
        <div className="relative">
          <input
            type="text"
            className={`input input-bordered w-full pr-10 ${touched.connectionURL && errors.connectionURL ? 'border-red-500' : ''}`}
            placeholder="Enter your database connection URI"
            value={connectionURL}
            onChange={handleConnectionURLChange}
            onBlur={() => handleBlur('connectionURL')}
          />
          <div className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer tooltip-container">
            <span className="tooltip-icon">?</span>
            <div className="tooltip-content">
              {getExampleConnectionURL()}  {/* Tooltip shows based on selected DB */}
            </div>
          </div>
        </div>
        {touched.connectionURL && errors.connectionURL && (
          <p className="mt-1 text-red-500 text-sm">{errors.connectionURL}</p>
        )}
      </div>

          {dbType === 'MongoDB' && (
            <div className="flex gap-4">
              <div className="py-2 relative flex-1">
                <label className="block font-bold mb-2">Database Name:</label>
                <div className="relative">
                  <input
                    type="text"
                    className={`input input-bordered w-full pr-10 ${touched.databaseName && errors.databaseName ? 'border-red-500' : ''}`}
                    placeholder="Enter database name"
                    value={databaseName}
                    onChange={handleDatabaseNameChange}
                    onBlur={() => handleBlur('databaseName')}
                  />
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer tooltip-container">
                    <span className="tooltip-icon">?</span>
                    <div className="tooltip-content">mydatabase</div>
                  </div>
                </div>
                {touched.databaseName && errors.databaseName && (
                  <p className="mt-1 text-red-500 text-sm">{errors.databaseName}</p>
                )}
              </div>

              <div className="py-2 relative flex-1">
                <label className="block font-bold mb-2">Collection Name:</label>
                <div className="relative">
                  <input
                    type="text"
                    className={`input input-bordered w-full pr-10 ${touched.collectionName && errors.collectionName ? 'border-red-500' : ''}`}
                    placeholder="Enter collection name"
                    value={collectionName}
                    onChange={handleCollectionNameChange}
                    onBlur={() => handleBlur('collectionName')}
                  />
                  <div className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer tooltip-container">
                    <span className="tooltip-icon">?</span>
                    <div className="tooltip-content">mycollection</div>
                  </div>
                </div>
                {touched.collectionName && errors.collectionName && (
                  <p className="mt-1 text-red-500 text-sm">{errors.collectionName}</p>
                )}
              </div>
            </div>
          )}

          {responseMessage && (
            <div className="alert alert-success my-4">{typeof responseMessage === 'object' ? JSON.stringify(responseMessage) : responseMessage}</div>
          )}

          {responseError && (
            <div className="alert alert-error my-4">{typeof responseError === 'object' ? JSON.stringify(responseError) : responseError}</div>
          )}

      <div className="modal-action">
        <button
          className={`btn ${isLoading ? 'btn-disabled' : ''}`}
          onClick={handleSubmit}
          disabled={isLoading} // Disable the button while loading
        >
          {isLoading ? (
            <span className="loader"></span> // Replace with your loader component or spinner
          ) : (
            'Save and Connect'
          )}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => chatStore.toggleInstuctionModal(false)}
          disabled={isLoading} // Optionally disable cancel while loading
        >
          Cancel
        </button>
      </div>

        </div>
      </div>
    </>
  );
}