import React from 'react';
import { TextField, Typography, Divider } from '@mui/material';
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

          // Check if this is the variable name field for SetVariable node
          const isVariableNameField = nodeType === 'SetVariable' && (input.key === 'name' || input.key === 'variableName');
          const hasError = isVariableNameField && !!variableError;

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
                helperText={
                  hasError ? variableError : isReadOnly ? 'Start/End nodes cannot be edited' : viewOnly ? 'View only mode' : `Default: ${input.defaultValue}. Drop variables here.`
                }
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
