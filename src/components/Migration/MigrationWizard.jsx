import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { Database, ArrowRight, Check, AlertTriangle, X } from 'lucide-react';
import { migrateAllData, clearLocalData } from '../../utils/migration';

const MigrationWizard = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  
  const { user } = useAuth();
  const { showError, showSuccess } = useUI();

  useEffect(() => {
    // Check if there's data in localStorage to migrate
    const inventory = localStorage.getItem('fishInventory');
    const sales = localStorage.getItem('fishSales');
    
    setHasLocalData(!!(inventory || sales));
  }, []);

  const handleStartMigration = async () => {
    if (!user) {
      showError('You must be logged in to migrate data');
      return;
    }
    
    try {
      setIsProcessing(true);
      
      const result = await migrateAllData(user.id);
      setMigrationResult(result);
      
      if (result.success) {
        showSuccess('Data migration completed successfully');
        setStep(3);
      } else {
        showError('Some errors occurred during migration');
        setStep(3);
      }
    } catch (error) {
      console.error('Migration error:', error);
      showError(error.message || 'Failed to migrate data');
      setMigrationResult({
        success: false,
        error: error.message
      });
      setStep(3);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearLocalData = () => {
    try {
      clearLocalData();
      showSuccess('Local data cleared successfully');
      
      if (onComplete) {
        onComplete();
      }
    } catch (error) {
      console.error('Error clearing local data:', error);
      showError(error.message || 'Failed to clear local data');
    }
  };

  const handleSkip = () => {
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="bg-white/10 rounded-full p-3 inline-flex mb-4">
          <Database size={24} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Data Migration Wizard</h2>
        <p className="text-white/70">Migrate your local data to the cloud for secure storage and access from anywhere</p>
      </div>
      
      {/* Step 1: Introduction */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Why Migrate Your Data?</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                <span className="text-white">
                  <strong>Secure Cloud Storage:</strong> Keep your inventory and sales data safe in the cloud
                </span>
              </li>
              <li className="flex items-start">
                <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                <span className="text-white">
                  <strong>Access Anywhere:</strong> Use Fish Ledger from any device, anytime
                </span>
              </li>
              <li className="flex items-start">
                <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                <span className="text-white">
                  <strong>Real-time Updates:</strong> Changes sync instantly across all your devices
                </span>
              </li>
              <li className="flex items-start">
                <Check size={18} className="text-green-400 mr-2 mt-0.5" />
                <span className="text-white">
                  <strong>Never Lose Data:</strong> Prevent data loss from browser clearing or device changes
                </span>
              </li>
            </ul>
            
            {!hasLocalData && (
              <div className="mt-6 p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-yellow-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">No Local Data Detected</p>
                    <p className="text-white/70 text-sm">
                      We couldn't find any existing data in your browser storage. You can skip this migration.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={handleSkip}
              className="text-white/70 hover:text-white transition-colors"
            >
              Skip Migration
            </button>
            
            <button
              onClick={() => setStep(2)}
              disabled={!hasLocalData}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span>Continue</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      )}
      
      {/* Step 2: Confirmation */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <h3 className="text-lg font-medium text-white mb-4">Ready to Migrate</h3>
            <p className="text-white/70 mb-6">
              We'll migrate your existing inventory and sales data to your cloud account. This process is safe and your local data will remain until you choose to clear it.
            </p>
            
            <div className="p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg mb-6">
              <div className="flex items-start">
                <Database size={20} className="text-blue-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-white font-medium">Data to Migrate</p>
                  <ul className="text-white/70 text-sm mt-2 space-y-1">
                    <li>• Inventory items and stock levels</li>
                    <li>• Sales history and transaction records</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-white/70 text-sm">
                <strong className="text-white">Note:</strong> The migration process may take a few moments depending on the amount of data. Please don't close this window during migration.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="text-white/70 hover:text-white transition-colors"
            >
              Back
            </button>
            
            <button
              onClick={handleStartMigration}
              disabled={isProcessing}
              className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  <span>Migrating Data...</span>
                </>
              ) : (
                <>
                  <span>Start Migration</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Step 3: Results */}
      {step === 3 && migrationResult && (
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="text-center mb-6">
              {migrationResult.success ? (
                <div className="bg-green-500/20 rounded-full p-3 inline-flex mb-4">
                  <Check size={24} className="text-green-400" />
                </div>
              ) : (
                <div className="bg-red-500/20 rounded-full p-3 inline-flex mb-4">
                  <X size={24} className="text-red-400" />
                </div>
              )}
              
              <h3 className="text-lg font-medium text-white mb-2">
                {migrationResult.success ? 'Migration Complete' : 'Migration Completed with Errors'}
              </h3>
              <p className="text-white/70">
                {migrationResult.success 
                  ? 'Your data has been successfully migrated to the cloud.'
                  : 'Some of your data could not be migrated. See details below.'}
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Inventory Migration</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Items migrated:</span>
                  <span className="text-white">{migrationResult.inventory?.migrated || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Errors:</span>
                  <span className={migrationResult.inventory?.errors > 0 ? 'text-red-400' : 'text-white'}>
                    {migrationResult.inventory?.errors || 0}
                  </span>
                </div>
              </div>
              
              <div className="p-4 bg-white/5 rounded-lg">
                <h4 className="text-white font-medium mb-2">Sales Migration</h4>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Sales migrated:</span>
                  <span className="text-white">{migrationResult.sales?.migrated || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/70">Errors:</span>
                  <span className={migrationResult.sales?.errors > 0 ? 'text-red-400' : 'text-white'}>
                    {migrationResult.sales?.errors || 0}
                  </span>
                </div>
              </div>
              
              {!migrationResult.success && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <div className="flex items-start">
                    <AlertTriangle size={20} className="text-red-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-white font-medium">Some errors occurred</p>
                      <p className="text-white/70 text-sm">
                        Not all data could be migrated. You can try again or continue with the partially migrated data.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            {!migrationResult.success && (
              <button
                onClick={() => setStep(2)}
                className="text-white/70 hover:text-white transition-colors"
              >
                Try Again
              </button>
            )}
            
            <div className="flex gap-4">
              <button
                onClick={handleSkip}
                className="text-white/70 hover:text-white transition-colors"
              >
                {migrationResult.success ? 'Keep Local Data' : 'Continue Without Clearing'}
              </button>
              
              <button
                onClick={handleClearLocalData}
                className="flex items-center gap-2 bg-primary hover:bg-primary/80 text-white px-6 py-2.5 rounded-lg transition-colors"
              >
                <span>Clear Local Data & Continue</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MigrationWizard;

