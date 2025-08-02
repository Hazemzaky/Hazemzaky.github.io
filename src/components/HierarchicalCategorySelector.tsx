import React from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Typography
} from '@mui/material';

interface HierarchicalCategorySelectorProps {
  value: {
    type?: string;
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
    subSubSubCategory?: string;
    subSubSubSubCategory?: string;
  };
  onChange: (categories: {
    type?: string;
    mainCategory?: string;
    subCategory?: string;
    subSubCategory?: string;
    subSubSubCategory?: string;
    subSubSubSubCategory?: string;
  }) => void;
  error?: string;
}

// Asset types (first level)
const AssetTypes = ['Vehicle', 'Attachment', 'Equipment', 'Building', 'Furniture', 'IT', 'Other'];

// Main categories (second level) - depends on type
const AssetMainCategories = {
  'Vehicle': ['Truck', 'Car', 'Van', 'Bus', 'Trailer', 'Motorcycle', 'Forklift'],
  'Attachment': ['Trailer Hitch', 'Crane Attachment', 'Bucket Attachment', 'Fork Attachment', 'Grapple Attachment', 'Trailer Attachment'],
  'Equipment': ['Crane', 'Excavator', 'Bulldozer', 'Generator', 'Compressor', 'Welder', 'Drill'],
  'Building': ['Office', 'Warehouse', 'Workshop', 'Showroom', 'Storage Facility', 'Maintenance Bay'],
  'Furniture': ['Desk', 'Chair', 'Cabinet', 'Table', 'Shelf', 'Filing Cabinet', 'Conference Table'],
  'IT': ['Computer', 'Laptop', 'Printer', 'Server', 'Network Device', 'Scanner', 'Projector'],
  'Other': ['Tools', 'Safety Equipment', 'Office Supplies', 'Miscellaneous']
};

// Sub categories (third level) - depends on main category
const AssetSubCategories = {
  // Vehicle sub categories
  'Truck': ['Light-Duty Truck', 'Medium-Duty Truck', 'Heavy-Duty Truck', 'Dump Truck', 'Tank Truck'],
  'Car': ['Sedan', 'SUV', 'Pickup', 'Van', 'Sports Car'],
  'Van': ['Passenger Van', 'Cargo Van', 'Mini Van', 'Delivery Van'],
  'Bus': ['School Bus', 'Transit Bus', 'Coach Bus', 'Mini Bus'],
  'Trailer': ['Flatbed Trailer', 'Enclosed Trailer', 'Tank Trailer', 'Dump Trailer'],
  'Motorcycle': ['Street Bike', 'Dirt Bike', 'Scooter', 'Touring Bike'],
  'Forklift': ['Electric Forklift', 'Gas Forklift', 'Diesel Forklift', 'Rough Terrain Forklift'],
  
  // Attachment sub categories
  'Trailer Hitch': ['Ball Hitch', 'Fifth Wheel', 'Gooseneck', 'Bumper Pull'],
  'Crane Attachment': ['Jib Extension', 'Hook Block', 'Grapple', 'Magnet'],
  'Bucket Attachment': ['General Purpose', 'Rock Bucket', 'Trenching', 'Skeleton'],
  'Fork Attachment': ['Pallet Forks', 'Bale Spear', 'Log Fork', 'Man Basket'],
  'Grapple Attachment': ['Rock Grapple', 'Log Grapple', 'Multi-Purpose', 'Rotating'],
  'Trailer Attachment': ['Curtain Side Trailer (Tautliner)', 'Flatbed Trailer', 'Box Trailer (Dry Van)', 'Refrigerated Trailer (Reefer)', 'Tanker Trailer', 'Tipper / Dump Trailer', 'Container Chassis', 'Lowboy Trailer / Low Loader', 'Livestock Trailer', 'Car Carrier Trailer', 'Logging Trailer', 'Hopper Trailer', 'Skeletal Trailer', 'Tank Container (ISO Tank)', 'Walking Floor Trailer'],
  
  // Equipment sub categories
  'Crane': ['Mobile Crane', 'Tower Crane', 'Crawler Crane', 'Rough Terrain Crane'],
  'Excavator': ['Mini Excavator', 'Standard Excavator', 'Large Excavator', 'Long Reach'],
  'Bulldozer': ['Small Dozer', 'Medium Dozer', 'Large Dozer', 'Track Dozer'],
  'Generator': ['Portable Generator', 'Standby Generator', 'Industrial Generator', 'Diesel Generator'],
  'Compressor': ['Air Compressor', 'Refrigerant Compressor', 'Gas Compressor', 'Oil Compressor'],
  'Welder': ['Arc Welder', 'MIG Welder', 'TIG Welder', 'Plasma Cutter'],
  'Drill': ['Hand Drill', 'Hammer Drill', 'Rotary Hammer', 'Core Drill'],
  
  // Building sub categories
  'Office': ['Executive Office', 'Open Plan', 'Conference Room', 'Reception Area'],
  'Warehouse': ['Storage Warehouse', 'Distribution Center', 'Cold Storage', 'High Bay'],
  'Workshop': ['Mechanical Workshop', 'Electrical Workshop', 'Welding Shop', 'Assembly Area'],
  'Showroom': ['Vehicle Showroom', 'Equipment Showroom', 'Furniture Showroom', 'Display Area'],
  'Storage Facility': ['Bulk Storage', 'Rack Storage', 'Container Storage', 'Specialized Storage'],
  'Maintenance Bay': ['Service Bay', 'Inspection Bay', 'Wash Bay', 'Paint Bay'],
  
  // Furniture sub categories
  'Desk': ['Executive Desk', 'Workstation Desk', 'Standing Desk', 'Conference Table'],
  'Chair': ['Office Chair', 'Conference Chair', 'Visitor Chair', 'Ergonomic Chair'],
  'Cabinet': ['Filing Cabinet', 'Storage Cabinet', 'Display Cabinet', 'Tool Cabinet'],
  'Table': ['Conference Table', 'Work Table', 'Dining Table', 'Display Table'],
  'Shelf': ['Book Shelf', 'Storage Shelf', 'Display Shelf', 'Wire Shelf'],
  'Filing Cabinet': ['Lateral File', 'Vertical File', 'Mobile File', 'Fireproof File'],
  'Conference Table': ['Boardroom Table', 'Training Table', 'Meeting Table', 'Presentation Table'],
  
  // IT sub categories
  'Computer': ['Desktop Computer', 'Workstation', 'Server', 'Mini Computer'],
  'Laptop': ['Business Laptop', 'Gaming Laptop', 'Ultrabook', 'Rugged Laptop'],
  'Printer': ['Laser Printer', 'Inkjet Printer', '3D Printer', 'Label Printer'],
  'Server': ['File Server', 'Web Server', 'Database Server', 'Application Server'],
  'Network Device': ['Router', 'Switch', 'Firewall', 'Access Point'],
  'Scanner': ['Document Scanner', 'Barcode Scanner', '3D Scanner', 'Flatbed Scanner'],
  'Projector': ['LCD Projector', 'DLP Projector', 'LED Projector', 'Short Throw Projector'],
  
  // Other sub categories
  'Tools': ['Hand Tools', 'Power Tools', 'Measuring Tools', 'Specialty Tools'],
  'Safety Equipment': ['PPE', 'Safety Signs', 'Emergency Equipment', 'Monitoring Devices'],
  'Office Supplies': ['Paper Products', 'Writing Supplies', 'Storage Supplies', 'Presentation Supplies'],
  'Miscellaneous': ['Custom Items', 'Special Equipment', 'Temporary Items', 'Uncategorized']
};

// Sub-sub categories (fourth level) - depends on sub category
const AssetSubSubCategories = {
  // Vehicle examples
  'Light-Duty Truck': ['Pickup Truck', 'Mini Truck', 'Delivery Truck'],
  'Medium-Duty Truck': ['Box Truck', 'Flatbed Truck', 'Dump Truck'],
  'Heavy-Duty Truck': ['Tractor Trailer', 'Articulated Truck', 'Multi-Axle Truck'],
  
  // Equipment examples
  'Mobile Crane': ['Boom Truck', 'All Terrain Crane', 'Rough Terrain Crane'],
  'Mini Excavator': ['Compact Excavator', 'Micro Excavator', 'Zero Tail Swing'],
  'Portable Generator': ['Gas Generator', 'Diesel Generator', 'Inverter Generator'],
  
  // Building examples
  'Executive Office': ['Corner Office', 'Standard Office', 'Shared Office'],
  'Storage Warehouse': ['Bulk Storage', 'Rack Storage', 'Automated Storage'],
  'Mechanical Workshop': ['Engine Repair', 'Transmission Repair', 'General Repair'],
  
  // Furniture examples
  'Executive Desk': ['L-Shaped Desk', 'Straight Desk', 'Standing Desk'],
  'Office Chair': ['Executive Chair', 'Task Chair', 'Guest Chair'],
  'Filing Cabinet': ['2-Drawer', '3-Drawer', '4-Drawer', '5-Drawer'],
  
  // IT examples
  'Desktop Computer': ['Workstation', 'Gaming PC', 'All-in-One'],
  'Laser Printer': ['Monochrome', 'Color', 'Multifunction'],
  'Router': ['Wireless Router', 'Wired Router', 'VPN Router']
};

// Sub-sub-sub categories (fifth level) - depends on sub-sub category
const AssetSubSubSubCategories = {
  // Vehicle examples
  'Pickup Truck': ['Single Cab', 'Extended Cab', 'Crew Cab'],
  'Box Truck': ['Standard Box', 'Refrigerated Box', 'Insulated Box'],
  'Mobile Crane': ['Boom Truck', 'All Terrain', 'Rough Terrain'],
  
  // Equipment examples
  'Compact Excavator': ['Mini Excavator', 'Micro Excavator', 'Zero Tail'],
  'Gas Generator': ['Portable', 'Standby', 'Inverter'],
  'Laser Printer': ['Monochrome', 'Color', 'Multifunction'],
  
  // Building examples
  'Corner Office': ['Large', 'Medium', 'Small'],
  'Bulk Storage': ['High Bay', 'Low Bay', 'Mezzanine'],
  'Engine Repair': ['Heavy Equipment', 'Automotive', 'Marine'],
  
  // Furniture examples
  'L-Shaped Desk': ['Left Return', 'Right Return', 'Corner'],
  'Executive Chair': ['High Back', 'Mid Back', 'Low Back'],
  '2-Drawer': ['Letter Size', 'Legal Size', 'A4 Size']
};

const HierarchicalCategorySelector: React.FC<HierarchicalCategorySelectorProps> = ({ value, onChange, error }) => {
  const handleCategoryChange = (level: number, categoryName: string) => {
    const newValue = { ...value };
    
    switch (level) {
      case 1: // Type
        newValue.type = categoryName;
        newValue.mainCategory = '';
        newValue.subCategory = '';
        newValue.subSubCategory = '';
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 2: // Main Category
        newValue.mainCategory = categoryName;
        newValue.subCategory = '';
        newValue.subSubCategory = '';
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 3: // Sub Category
        newValue.subCategory = categoryName;
        newValue.subSubCategory = '';
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 4: // Sub-Sub Category
        newValue.subSubCategory = categoryName;
        newValue.subSubSubCategory = '';
        newValue.subSubSubSubCategory = '';
        break;
      case 5: // Sub-Sub-Sub Category
        newValue.subSubSubCategory = categoryName;
        newValue.subSubSubSubCategory = '';
        break;
      case 6: // Sub-Sub-Sub-Sub Category (manual entry)
        newValue.subSubSubSubCategory = categoryName;
        break;
    }
    
    onChange(newValue);
  };

  const getMainCategories = () => {
    return value.type ? AssetMainCategories[value.type as keyof typeof AssetMainCategories] || [] : [];
  };

  const getSubCategories = () => {
    return value.mainCategory ? AssetSubCategories[value.mainCategory as keyof typeof AssetSubCategories] || [] : [];
  };

  const getSubSubCategories = () => {
    return value.subCategory ? AssetSubSubCategories[value.subCategory as keyof typeof AssetSubSubCategories] || [] : [];
  };

  const getSubSubSubCategories = () => {
    return value.subSubCategory ? AssetSubSubSubCategories[value.subSubCategory as keyof typeof AssetSubSubSubCategories] || [] : [];
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Asset Categories</Typography>
      
      {/* Type (First Level) */}
      <TextField
        select
        label="Type"
        value={value.type || ''}
        onChange={(e) => handleCategoryChange(1, e.target.value)}
        fullWidth
        required
        error={!!error}
        helperText={error}
        sx={{ mb: 2 }}
      >
        <MenuItem value="">Select Type</MenuItem>
        {AssetTypes.map((type) => (
          <MenuItem key={type} value={type}>
            {type}
          </MenuItem>
        ))}
      </TextField>

      {/* Main Category (Second Level) */}
      {value.type && (
        <TextField
          select
          label="Main Category"
          value={value.mainCategory || ''}
          onChange={(e) => handleCategoryChange(2, e.target.value)}
          fullWidth
          required
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select Main Category</MenuItem>
          {getMainCategories().map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Sub Category (Third Level) */}
      {value.mainCategory && (
        <TextField
          select
          label="Sub Category"
          value={value.subCategory || ''}
          onChange={(e) => handleCategoryChange(3, e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select Sub Category</MenuItem>
          {getSubCategories().map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Sub-Sub Category (Fourth Level) */}
      {value.subCategory && (
        <TextField
          select
          label="Sub-Sub Category"
          value={value.subSubCategory || ''}
          onChange={(e) => handleCategoryChange(4, e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select Sub-Sub Category</MenuItem>
          {getSubSubCategories().map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Sub-Sub-Sub Category (Fifth Level) */}
      {value.subSubCategory && (
        <TextField
          select
          label="Sub-Sub-Sub Category"
          value={value.subSubSubCategory || ''}
          onChange={(e) => handleCategoryChange(5, e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select Sub-Sub-Sub Category</MenuItem>
          {getSubSubSubCategories().map((category) => (
            <MenuItem key={category} value={category}>
              {category}
            </MenuItem>
          ))}
        </TextField>
      )}

      {/* Sub-Sub-Sub-Sub Category (Sixth Level - Manual Entry) */}
      {value.subSubSubCategory && (
        <TextField
          label="Sub-Sub-Sub-Sub Category (Manual Entry)"
          value={value.subSubSubSubCategory || ''}
          onChange={(e) => handleCategoryChange(6, e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="Enter custom category..."
        />
      )}
    </Box>
  );
};

export default HierarchicalCategorySelector; 