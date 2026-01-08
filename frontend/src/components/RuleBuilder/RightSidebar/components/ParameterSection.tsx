import React from 'react';
import { TextField, Typography, Divider, Select, MenuItem, FormControl, InputLabel, FormHelperText } from '@mui/material';
import type { Node } from '@xyflow/react';
import type { NodeInput } from '../../../../utils/Templates/customFuncTemplate';
import { PropertyRow, SectionContainer, SectionTitle } from '../styles';

interface ParameterSectionProps {
  inputs: NodeInput[];
  currentParams: Record<string, string>;
  onParamChange: (paramKey: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onDrop: (paramKey: string) => (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement>>;
  variableError: string | null;
  isReadOnly: boolean;
  viewOnly: boolean;
  nodeType?: string;
  allNodes?: Node[];
  getFieldError?: (fieldName: string) => string | undefined;
}

const ParameterSection: React.FC<ParameterSectionProps> = ({
  inputs,
  currentParams,
  onParamChange,
  onDrop,
  onDragOver,
  inputRefs: inputRefsRef,
  variableError,
  isReadOnly,
  viewOnly,
  nodeType,
  getFieldError,
}) => {
  if (!inputs || inputs.length === 0) return null;

  return (
    <>
      <Divider />
      <SectionContainer>
        <SectionTitle>Parameters</SectionTitle>

        {inputs.map((input) => {
          const currentValue = currentParams[input.key] ?? input.defaultValue;
          const hasGlobalVariable =
            currentValue &&
            typeof currentValue === 'string' &&
            /\{\{\s*.+?\s*\}\}/.test(currentValue);

          // Determine if this should be a multiline input
          const isMultiline = input.key === 'code' || input.key === 'query' || input.key === 'importStatement' || currentValue.length > 50;

          // Check for validation errors
          const fieldError = getFieldError?.(input.key);
          
          // Check if this is the variable name field for SetVariable node
          const isVariableNameField = nodeType === 'SetVariable' && (input.key === 'name' || input.key === 'variableName');
          const hasError = !!fieldError || (isVariableNameField && !!variableError);
          
          // Determine helper text
          const helperText = fieldError 
            || (isVariableNameField && variableError) 
            || (isReadOnly ? 'Start/End nodes cannot be edited' : '')
            || (viewOnly ? 'View only mode' : '')
            || `Default: ${input.defaultValue}. Drop variables here.`;

          // Render dropdown for declarationType
          if (input.key === 'declarationType') {
            return (
              <PropertyRow key={input.key}>
                <FormControl fullWidth size="small" error={hasError} disabled={isReadOnly || viewOnly}>
                  <InputLabel>{input.label}</InputLabel>
                  <Select
                    value={currentValue || 'var'}
                    onChange={(e) => {
                      const syntheticEvent = {
                        target: { value: e.target.value as string }
                      } as React.ChangeEvent<HTMLInputElement>;
                      onParamChange(input.key)(syntheticEvent);
                    }}
                    label={input.label}
                  >
                    <MenuItem value="var">var</MenuItem>
                    <MenuItem value="let">let</MenuItem>
                    <MenuItem value="const">const</MenuItem>
                  </Select>
                  {helperText && <FormHelperText>{helperText}</FormHelperText>}
                </FormControl>
              </PropertyRow>
            );
          }

          // Render dropdown for dataType
          if (input.key === 'dataType') {
            return (
              <PropertyRow key={input.key}>
                <FormControl fullWidth size="small" error={hasError} disabled={isReadOnly || viewOnly}>
                  <InputLabel>{input.label}</InputLabel>
                  <Select
                    value={currentValue || 'any'}
                    onChange={(e) => {
                      const syntheticEvent = {
                        target: { value: e.target.value as string }
                      } as React.ChangeEvent<HTMLInputElement>;
                      onParamChange(input.key)(syntheticEvent);
                    }}
                    label={input.label}
                  >
                    <MenuItem value="string">string</MenuItem>
                    <MenuItem value="number">number</MenuItem>
                    <MenuItem value="boolean">boolean</MenuItem>
                    <MenuItem value="array">array</MenuItem>
                    <MenuItem value="object">object</MenuItem>
                    <MenuItem value="any">any</MenuItem>
                    <MenuItem value="undefined">undefined</MenuItem>
                  </Select>
                  {helperText && <FormHelperText>{helperText}</FormHelperText>}
                </FormControl>
              </PropertyRow>
            );
          }

          return (
            <PropertyRow
              key={input.key}
              onDrop={onDrop(input.key)}
              onDragOver={onDragOver}
            >
              <TextField
                fullWidth
                label={
                  <>
                    {input.label}
                    {input.required && <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>*</Typography>}
                  </>
                }
                value={currentValue}
                onChange={onParamChange(input.key)}
                size="small"
                variant="outlined"
                multiline={isMultiline}
                rows={isMultiline ? 3 : 1}
                error={hasError}
                helperText={helperText}
                disabled={isReadOnly || viewOnly}
                inputRef={(el) => {
                  if (el) inputRefsRef.current[input.key] = el;
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontFamily: isMultiline ? 'monospace' : 'inherit',
                    fontSize: isMultiline ? '0.875rem' : 'inherit',
                    backgroundColor: 'background.paper',
                    transition: 'all 0.2s',
                  },
                  '& .MuiOutlinedInput-input': {
                    ...(hasGlobalVariable && {
                      background: `linear-gradient(to bottom, 
                        transparent 0%, 
                        transparent calc(100% - 2px), 
                        #4caf50 calc(100% - 2px), 
                        #4caf50 100%
                      )`,
                      backgroundSize: '100% 100%',
                      backgroundRepeat: 'no-repeat',
                    }),
                  },
                }}
              />
            </PropertyRow>
          );
        })}
      </SectionContainer>
    </>
  );
};

export default ParameterSection;
