import React from 'react';
import { TextField, Typography, Divider, Checkbox, FormControlLabel } from '@mui/material';
import type { Node } from '@xyflow/react';
import { PropertyRow, SectionContainer, SectionTitle } from '../styles';
import { getFunctionParameters, type FunctionParameter } from '../../../../utils/Flow/functionParameterUtils';

interface FunctionCallSectionProps {
  functionName: string;
  currentParams: Record<string, string>;
  onParamChange: (paramKey: string) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onParamBlur?: () => void;
  onDrop: (paramKey: string) => (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  inputRefs: React.MutableRefObject<Record<string, HTMLInputElement | HTMLTextAreaElement>>;
  isReadOnly: boolean;
  viewOnly: boolean;
  allNodes?: Node[];
  getFieldError?: (fieldName: string) => string | undefined;
}

const FunctionCallSection: React.FC<FunctionCallSectionProps> = ({
  functionName,
  currentParams,
  onParamChange,
  onParamBlur,
  onDrop,
  onDragOver,
  inputRefs: inputRefsRef,
  isReadOnly,
  viewOnly,
  allNodes,
  getFieldError,
}) => {
  // Get function parameters from definition node or API
  const parameters = React.useMemo(
    () => getFunctionParameters(functionName, allNodes),
    [functionName, allNodes]
  );

  if (!parameters || parameters.length === 0) {
    return (
      <SectionContainer>
        <SectionTitle>Function Call</SectionTitle>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 1 }}>
          No parameters found for function "{functionName}". Make sure the function definition exists on the main canvas.
        </Typography>
      </SectionContainer>
    );
  }

  // Check if user wants to store result
  const storeResult = currentParams['storeResult'] !== 'false'; // Default to true

  return (
    <>
      <Divider />
      <SectionContainer>
        <SectionTitle>Function Call: {functionName}</SectionTitle>

        {/* Store Result Checkbox */}
        <PropertyRow>
          <FormControlLabel
            control={
              <Checkbox
                checked={storeResult}
                onChange={(e) => {
                  const syntheticEvent = {
                    target: { value: e.target.checked ? 'true' : 'false' }
                  } as React.ChangeEvent<HTMLInputElement>;
                  onParamChange('storeResult')(syntheticEvent);
                }}
                disabled={isReadOnly || viewOnly}
              />
            }
            label="Store result in variable"
          />
        </PropertyRow>

        {/* Result Variable Name (only if storing result) */}
        {storeResult && (
          <PropertyRow>
            <TextField
              fullWidth
              size="small"
              label="Result Variable Name"
              value={currentParams['resultVariable'] || 'result'}
              onChange={onParamChange('resultVariable')}
              onBlur={onParamBlur}
              onDrop={onDrop('resultVariable')}
              onDragOver={onDragOver}
              inputRef={(el: HTMLInputElement) => {
                if (el) inputRefsRef.current['resultVariable'] = el;
              }}
              disabled={isReadOnly || viewOnly}
              error={!!getFieldError?.('resultVariable')}
              helperText={getFieldError?.('resultVariable') || 'Variable to store the function result'}
              placeholder="result"
            />
          </PropertyRow>
        )}

        <Divider sx={{ my: 2 }} />
        
        {/* Dynamic Parameter Inputs */}
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
          Function Arguments
        </Typography>

        {parameters.map((param: FunctionParameter, index: number) => {
          const currentValue = currentParams[param.name] || '';
          const hasGlobalVariable = /\{\{\s*.+?\s*\}\}/.test(currentValue);
          const fieldError = getFieldError?.(param.name);

          return (
            <PropertyRow key={param.name}>
              <TextField
                fullWidth
                size="small"
                label={`${param.label} (${param.type})`}
                value={currentValue}
                onChange={onParamChange(param.name)}
                onBlur={onParamBlur}
                onDrop={onDrop(param.name)}
                onDragOver={onDragOver}
                inputRef={(el: HTMLInputElement | HTMLTextAreaElement) => {
                  if (el) inputRefsRef.current[param.name] = el;
                }}
                disabled={isReadOnly || viewOnly}
                error={!!fieldError}
                helperText={
                  fieldError ||
                  (hasGlobalVariable 
                    ? '✓ Using global variable' 
                    : `Argument ${index + 1}: ${param.name}. Drop variables or enter value.`)
                }
                placeholder={`Enter ${param.name}`}
                sx={{
                  '& .MuiOutlinedInput-root': hasGlobalVariable
                    ? {
                        backgroundColor: 'rgba(76, 175, 80, 0.08)',
                        '& fieldset': { borderColor: 'success.main' },
                      }
                    : {},
                }}
              />
            </PropertyRow>
          );
        })}

        {/* Code Preview */}
        <PropertyRow sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Generated code: {' '}
            {storeResult && (
              <Typography component="span" variant="caption" color="primary.main">
                const {currentParams['resultVariable'] || 'result'} = {' '}
              </Typography>
            )}
            <Typography component="span" variant="caption" color="secondary.main">
              {functionName}(
              {parameters.map((p, i) => (
                <React.Fragment key={p.name}>
                  {currentParams[p.name] || `<${p.name}>`}
                  {i < parameters.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
              )
            </Typography>
          </Typography>
        </PropertyRow>
      </SectionContainer>
    </>
  );
};

export default FunctionCallSection;
