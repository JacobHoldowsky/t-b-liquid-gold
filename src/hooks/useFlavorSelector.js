import { useState, useCallback } from "react";

/**
 * Custom hook to manage flavor selection
 * @param {string[]} initialFlavors - Array of initial flavors selected
 * @param {string[]} availableFlavors - Array of available flavors to select from
 * @param {number} requiredCount - Optional, number of required flavors to select
 * @returns {object} - Contains selected flavors, handlers for changing flavors, and validation functions
 */
const useFlavorSelector = (
  initialFlavors,
  availableFlavors,
  requiredCount = null
) => {
  const [selectedFlavors, setSelectedFlavors] = useState(initialFlavors);

  // Handler to change the selected flavor at a specific index
  const handleFlavorChange = useCallback(
    (index, flavor) => {
      const newFlavors = [...selectedFlavors];
      newFlavors[index] = flavor;
      setSelectedFlavors(newFlavors);
    },
    [selectedFlavors]
  );

  // Validation function to check if the required number of flavors are selected
  const validateFlavorSelection = useCallback(() => {
    if (requiredCount !== null) {
      return selectedFlavors.length === requiredCount;
    }
    return true;
  }, [selectedFlavors, requiredCount]);

  return {
    selectedFlavors,
    handleFlavorChange,
    validateFlavorSelection,
  };
};

export default useFlavorSelector;
