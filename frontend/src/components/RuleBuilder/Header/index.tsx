import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Tooltip,
  Divider,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CodeIcon from '@mui/icons-material/Code';
import DataObjectIcon from '@mui/icons-material/DataObject';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import { StyledToolbar, ButtonGroup, ActionButton } from './styles';

interface HeaderProps {
  isPlaying?: boolean;
  onPlayClick: () => void;
  onStopClick: () => void;
  onDisplayJson: () => void;
  onGenerateCode: () => void;
  disabled?: boolean;
  viewOnly?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  isPlaying = false,
  onPlayClick,
  onStopClick,
  onDisplayJson,
  onGenerateCode,
  disabled = false,
  viewOnly = false,
}) => {
  return (
    <Paper elevation={0} square>
      <StyledToolbar>
        <Box display="flex" alignItems="center" gap={1}>
          <AccountTreeIcon color="primary" sx={{ fontSize: 28 }} />
          <Typography
            variant="h6"
            component="h1"
            fontWeight={600}
            color="text.primary"
          >
            Rule Builder {viewOnly && '(View Only)'}
          </Typography>
        </Box>

        <ButtonGroup>
          {!isPlaying ? (
            <Tooltip title="Run flow animation">
              <ActionButton
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={onPlayClick}
                disabled={disabled}
                sx={{
                  minWidth: '100px',
                }}
              >
                Play
              </ActionButton>
            </Tooltip>
          ) : (
            <Tooltip title="Stop animation">
              <ActionButton
                variant="contained"
                color="error"
                startIcon={<StopIcon />}
                onClick={onStopClick}
                sx={{
                  minWidth: '100px',
                }}
              >
                Stop
              </ActionButton>
            </Tooltip>
          )}

          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />

          <Tooltip title="View flow structure as JSON">
            <ActionButton
              variant="outlined"
              color="info"
              startIcon={<DataObjectIcon />}
              onClick={onDisplayJson}
              disabled={disabled || isPlaying}
            >
              Display JSON
            </ActionButton>
          </Tooltip>

          <Tooltip title="Generate executable TypeScript code">
            <ActionButton
              variant="contained"
              color="secondary"
              startIcon={<CodeIcon />}
              onClick={onGenerateCode}
              disabled={disabled || isPlaying}
              sx={{
                background: 'linear-gradient(45deg, #9c27b0 30%, #ba68c8 90%)',
                boxShadow: '0 2px 4px rgba(156, 39, 176, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #7b1fa2 30%, #9c27b0 90%)',
                  boxShadow: '0 3px 6px rgba(156, 39, 176, 0.4)',
                },
              }}
            >
              Generate Code
            </ActionButton>
          </Tooltip>
        </ButtonGroup>
      </StyledToolbar>
    </Paper>
  );
};

export default Header;
