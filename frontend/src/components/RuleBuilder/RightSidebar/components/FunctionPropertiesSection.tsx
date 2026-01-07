import React from 'react';
import { Box, Chip, Divider, Typography } from '@mui/material';
import type { FunctionNodeTemplate } from '../../../../utils/Templates/customFuncTemplate';
import { PropertyRow, SectionContainer, SectionTitle } from '../styles';

interface FunctionPropertiesSectionProps {
  template: FunctionNodeTemplate;
}

const FunctionPropertiesSection: React.FC<FunctionPropertiesSectionProps> = ({ template }) => {
  return (
    <>
      <Divider />
      <SectionContainer>
        <SectionTitle>Function Properties</SectionTitle>
        <PropertyRow>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Extensible:
            </Typography>
            <Chip
              label={template.isExtensible ? 'Yes' : 'No'}
              size="small"
              color={template.isExtensible ? 'primary' : 'default'}
              variant="outlined"
            />
          </Box>
        </PropertyRow>
      </SectionContainer>
    </>
  );
};

export default FunctionPropertiesSection;
