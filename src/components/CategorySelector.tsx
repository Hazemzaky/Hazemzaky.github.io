import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface CategoryNode {
  _id: string;
  name: string;
  level: number;
  parent?: string | null;
  children?: CategoryNode[];
}

interface CategorySelectorProps {
  value: {
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
    subSubSubCategory?: string;
    subSubSubSubCategory?: string;
  };
  onChange: (categories: {
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
    subSubSubCategory?: string;
    subSubSubSubCategory?: string;
  }) => void;
  error?: string;
}

// Predefined hierarchical category structure
const categoryHierarchy: Record<string, Record<string, Record<string, Record<string, string[]>>>> = {
  'Light-Duty Truck': {
    'Pickup Truck': {
      'Single Cab': {
        '2-Door': ['Compact Bed', 'Standard Bed'],
        '4-Door': ['Short Bed', 'Long Bed']
      },
      'Double Cab': {
        '4-Door': ['Short Bed', 'Long Bed'],
        'Extended Cab': ['Standard Bed', 'Utility Bed']
      },
      'Crew Cab': {
        'Full Rear Seating': ['Towing Package', 'Off-Road Package'],
        'Utility Configuration': ['Work Package', 'Recreation Package']
      }
    },
    'Mini Truck': {
      'Kei Trucks (Japanese Mini Trucks)': {
        'Dump Bed': ['Standard Dump', 'High-Side Dump'],
        'Flatbed': ['Standard Flatbed', 'Stake Sides'],
        'Enclosed Box': ['Cargo Box', 'Refrigerated Box']
      },
      'Compact Utility Trucks': {
        'Refrigerated Mini': ['Single Temp', 'Dual Compartment'],
        'Cargo Box Mini': ['Standard Box', 'High Cube'],
        'Tool Carrier': ['Open Sides', 'Enclosed Sides']
      }
    },
    'Urban Delivery Truck': {
      'Panel Delivery Truck': {
        'Enclosed Cargo': ['Standard Enclosure', 'Climate Controlled'],
        'Rear Roll-Up Door': ['Manual Roll-Up', 'Electric Roll-Up']
      },
      'Open Delivery Truck': {
        'Flatbed': ['Standard Flatbed', 'Drop-Side'],
        'Canvas-Covered': ['Manual Cover', 'Electric Cover']
      },
      'Refrigerated Delivery Truck': {
        'Single Temp': ['Standard Refrigeration', 'Deep Freeze'],
        'Dual Compartment': ['Split Temperature', 'Multi-Zone']
      }
    }
  },
  'Medium-Duty Truck': {
    'Box Truck (Straight Truck)': {
      'Standard Box': {
        'Rear Door (Liftgate / Ramp)': ['Manual Liftgate', 'Electric Liftgate'],
        'Side Door Access': ['Single Side Door', 'Multiple Side Doors']
      },
      'Refrigerated Box': {
        'Light Refrigeration': ['Standard Cooling', 'Multi-Temp'],
        'Deep-Freeze Capable': ['Ultra-Low Temp', 'Cryogenic']
      },
      'Insulated Dry Van': {
        'Foam-Core Panels': ['Standard Insulation', 'High R-Value'],
        'Temperature-Control Support': ['Basic HVAC', 'Advanced Climate Control']
      }
    },
    'Curtain-Side Truck': {
      'Manual Curtain': {
        'Pull-Rail with Locks': ['Standard Locks', 'Security Locks'],
        'Removable Roof Option': ['Partial Roof', 'Full Roof']
      },
      'Powered Curtain': {
        'Hydraulic Sliding': ['Single Hydraulic', 'Dual Hydraulic'],
        'Auto-Retraction': ['Standard Auto', 'Smart Auto']
      }
    },
    'Flatbed Truck': {
      'Standard Flatbed': {
        'Open Deck': ['Standard Deck', 'Reinforced Deck'],
        'Detachable Sides': ['Manual Detach', 'Quick Release']
      },
      'Drop-Side Flatbed': {
        'Foldable Panels': ['Manual Fold', 'Power Fold'],
        'Mid-Height Railings': ['Standard Height', 'Adjustable Height']
      },
      'Stake Flatbed': {
        'Vertical Posts': ['Standard Posts', 'Reinforced Posts'],
        'Modular Panels': ['Standard Panels', 'Custom Panels']
      }
    }
  },
  'Heavy-Duty Truck': {
    'Tractor Trailer (Semi-Truck)': {
      'Day Cab Tractor': {
        'No Sleeper': ['Standard Day Cab', 'Extended Day Cab'],
        'Regional Use': ['Regional Configuration', 'Local Configuration']
      },
      'Sleeper Cab Tractor': {
        'Mid Roof Sleeper': ['Standard Sleeper', 'Extended Sleeper'],
        'High Roof Sleeper': ['Tall Sleeper', 'Ultra-Tall Sleeper']
      },
      'Extended Chassis': {
        'Bunk Beds / Storage': ['Single Bunk', 'Double Bunk'],
        'Heavy Load Hauling': ['Standard Hauling', 'Heavy Hauling'],
        'Custom 5th Wheel Setup': ['Standard 5th Wheel', 'Custom 5th Wheel']
      }
    },
    'Articulated Truck': {
      'Tractor + Dolly': {
        'Rear-Loaded Config': ['Standard Rear Load', 'Heavy Rear Load'],
        'Heavy Axle Load': ['Standard Axle', 'Heavy Axle']
      },
      'Rear Steering Trailer': {
        'Self-Steering Axles': ['Single Self-Steer', 'Dual Self-Steer'],
        'Articulated Joints': ['Standard Joint', 'Heavy Joint']
      }
    },
    'Multi-Axle Truck': {
      '6-Wheeler (3 Axle)': {
        'Tandem Rear Axles': ['Standard Tandem', 'Heavy Tandem'],
        'Urban & Regional': ['Urban Config', 'Regional Config']
      },
      '10-Wheeler (5 Axle)': {
        'Tri Rear Axle Setup': ['Standard Tri', 'Heavy Tri'],
        'Extended Cargo Chassis': ['Standard Extended', 'Heavy Extended']
      },
      '18-Wheeler (Combination)': {
        'Full-Length Trailer Puller': ['Standard Puller', 'Heavy Puller'],
        'Maximum Payload Rated': ['Standard Payload', 'Maximum Payload']
      }
    }
  },
  'Dump Truck': {
    'Standard Dump Truck': {
      'Rear Tipper': {
        'Single Cylinder Lift': ['Standard Lift', 'Heavy Lift'],
        'Basic Steel Bed': ['Standard Bed', 'Reinforced Bed']
      },
      'Dual-Axle Dump': {
        'Increased Payload': ['Standard Payload', 'Heavy Payload'],
        'Heavy Bed Reinforcement': ['Standard Reinforcement', 'Heavy Reinforcement']
      }
    },
    'Side Dump Truck': {
      'Left / Right Tilt Bed': {
        'Twin Hydraulic Rams': ['Standard Rams', 'Heavy Rams'],
        'Stability Locks': ['Standard Locks', 'Heavy Locks']
      }
    },
    'Transfer Dump Truck': {
      'Pull-Along Hopper Trailer': {
        'Separate Controls': ['Manual Controls', 'Electric Controls'],
        'Aggregate Use': ['Standard Aggregate', 'Heavy Aggregate']
      }
    },
    'Super Dump Truck': {
      'Liftable Axles': {
        'Load-Legal Enhancement': ['Standard Enhancement', 'Heavy Enhancement'],
        'Asphalt or Gravel Specific': ['Asphalt Config', 'Gravel Config']
      },
      'Large Volume Bed': {
        'High Sides': ['Standard Sides', 'Extra High Sides'],
        'Multi-Payload': ['Standard Multi', 'Heavy Multi']
      }
    }
  },
  'Tank Truck': {
    'Fuel Tanker': {
      'Petrol Tanker': {
        'Compartmentalized': ['Standard Compartments', 'Multiple Compartments'],
        'Fireproof Valves': ['Standard Valves', 'Safety Valves']
      },
      'Diesel Tanker': {
        'Larger Compartment': ['Standard Large', 'Extra Large'],
        'Pump Dispensing': ['Manual Pump', 'Electric Pump']
      }
    },
    'Chemical Tanker': {
      'Corrosive Material': {
        'Stainless Steel Tank': ['Standard Stainless', 'Premium Stainless'],
        'Acid-Resistant Lining': ['Standard Lining', 'Premium Lining']
      },
      'Flammable Liquid': {
        'Explosion-Proof Seals': ['Standard Seals', 'Safety Seals'],
        'Emergency Valve System': ['Standard Emergency', 'Advanced Emergency']
      }
    },
    'Water Tanker': {
      'Potable Water Tanker': {
        'Food Grade Certified': ['Standard Food Grade', 'Premium Food Grade'],
        'UV-Protected Tank': ['Standard UV', 'Premium UV']
      },
      'Industrial Water Tanker': {
        'Non-Potable Storage': ['Standard Storage', 'Large Storage'],
        'Sloped Discharge Floor': ['Standard Slope', 'Heavy Slope']
      }
    }
  }
};

const CategorySelector: React.FC<CategorySelectorProps> = ({ value, onChange, error }) => {
  const [loading, setLoading] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addLevel, setAddLevel] = useState(1);
  const [newCategoryName, setNewCategoryName] = useState('');

  const getMainCategories = () => {
    return Object.keys(categoryHierarchy);
  };

  const getSubCategories = (mainCategory: string) => {
    return mainCategory ? Object.keys(categoryHierarchy[mainCategory] || {}) : [];
  };

  const getSubSubCategories = (mainCategory: string, subCategory: string) => {
    return mainCategory && subCategory 
      ? Object.keys(categoryHierarchy[mainCategory]?.[subCategory] || {}) 
      : [];
  };

  const getSubSubSubCategories = (mainCategory: string, subCategory: string, subSubCategory: string) => {
    return mainCategory && subCategory && subSubCategory
      ? Object.keys(categoryHierarchy[mainCategory]?.[subCategory]?.[subSubCategory] || {})
      : [];
  };

  const getSubSubSubSubCategories = (mainCategory: string, subCategory: string, subSubCategory: string, subSubSubCategory: string) => {
    return mainCategory && subCategory && subSubCategory && subSubSubCategory
      ? categoryHierarchy[mainCategory]?.[subCategory]?.[subSubCategory]?.[subSubSubCategory] || []
      : [];
  };

  const handleCategoryChange = (level: number, categoryName: string) => {
    const newValue = { ...value };
    
    switch (level) {
      case 1:
        newValue.mainCategory = categoryName;
        newValue.subCategory = '';
        newValue.subSubCategory = '';
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 2:
        newValue.subCategory = categoryName;
        newValue.subSubCategory = '';
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 3:
        newValue.subSubCategory = categoryName;
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 4:
        newValue.subSubSubCategory = categoryName;
        newValue.subSubSubSubCategory = '';
        break;
      case 5:
        newValue.subSubSubSubCategory = categoryName;
        break;
    }
    
    onChange(newValue);
  };

  const handleOpenAddDialog = (level: number) => {
    setAddLevel(level);
    setAddDialogOpen(true);
    setNewCategoryName('');
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    
    setLoading(true);
    try {
      // In a real implementation, you would call the API here
      // For now, we'll just close the dialog
      console.log(`Adding ${newCategoryName} at level ${addLevel}`);
      setAddDialogOpen(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Failed to add category:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Asset Categories</Typography>
      
      {/* Main Category */}
      <Box display="flex" gap={1} alignItems="center" mb={2}>
        <TextField
          select
          label="Main Category"
          value={value.mainCategory || ''}
          onChange={(e) => handleCategoryChange(1, e.target.value)}
          fullWidth
          error={!!error}
          helperText={error}
        >
          <MenuItem value="">Select Main Category</MenuItem>
          {getMainCategories().map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
        <Button
          variant="outlined"
          size="small"
          onClick={() => handleOpenAddDialog(1)}
          startIcon={<AddIcon />}
        >
          Add
        </Button>
      </Box>

      {/* Sub Category */}
      {value.mainCategory && (
        <Box display="flex" gap={1} alignItems="center" mb={2}>
          <TextField
            select
            label="Sub Category"
            value={value.subCategory || ''}
            onChange={(e) => handleCategoryChange(2, e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Sub Category</MenuItem>
            {getSubCategories(value.mainCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenAddDialog(2)}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
      )}

      {/* Sub-Sub Category */}
      {value.mainCategory && value.subCategory && (
        <Box display="flex" gap={1} alignItems="center" mb={2}>
          <TextField
            select
            label="Sub-Sub Category"
            value={value.subSubCategory || ''}
            onChange={(e) => handleCategoryChange(3, e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Sub-Sub Category</MenuItem>
            {getSubSubCategories(value.mainCategory, value.subCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenAddDialog(3)}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
      )}

      {/* Sub-Sub-Sub Category */}
      {value.mainCategory && value.subCategory && value.subSubCategory && (
        <Box display="flex" gap={1} alignItems="center" mb={2}>
          <TextField
            select
            label="Sub-Sub-Sub Category"
            value={value.subSubSubCategory || ''}
            onChange={(e) => handleCategoryChange(4, e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Sub-Sub-Sub Category</MenuItem>
            {getSubSubSubCategories(value.mainCategory, value.subCategory, value.subSubCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenAddDialog(4)}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
      )}

      {/* Sub-Sub-Sub-Sub Category (5th level) */}
      {value.mainCategory && value.subCategory && value.subSubCategory && value.subSubSubCategory && (
        <Box display="flex" gap={1} alignItems="center" mb={2}>
          <TextField
            select
            label="Sub-Sub-Sub-Sub Category"
            value={value.subSubSubSubCategory || ''}
            onChange={(e) => handleCategoryChange(5, e.target.value)}
            fullWidth
          >
            <MenuItem value="">Select Sub-Sub-Sub-Sub Category</MenuItem>
            {getSubSubSubSubCategories(value.mainCategory, value.subCategory, value.subSubCategory, value.subSubSubCategory).map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </TextField>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleOpenAddDialog(5)}
            startIcon={<AddIcon />}
          >
            Add
          </Button>
        </Box>
      )}

      {/* Add Category Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)}>
        <DialogTitle>Add New Category</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Adding category at level {addLevel}
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Category Name"
            fullWidth
            variant="outlined"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAddCategory} 
            variant="contained" 
            disabled={loading || !newCategoryName.trim()}
          >
            {loading ? <CircularProgress size={20} /> : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategorySelector; 