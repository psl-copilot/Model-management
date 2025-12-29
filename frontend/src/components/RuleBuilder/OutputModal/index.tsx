import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

interface OutputModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: string;
  emptyMessage?: string;
  onDownload?: () => void;
}

const OutputModal: React.FC<OutputModalProps> = ({
  open,
  onClose,
  title,
  content,
  emptyMessage = 'No content available',
  onDownload,
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '60vh',
          maxHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="h6" component="div">
          {title}
        </Typography>
        <Box>
          {content && (
            <>
              <IconButton
                onClick={handleCopy}
                size="small"
                sx={{ mr: 1 }}
                title="Copy to clipboard"
              >
                <ContentCopyIcon fontSize="small" />
              </IconButton>
              {onDownload && (
                <IconButton
                  onClick={onDownload}
                  size="small"
                  sx={{ mr: 1 }}
                  title="Download as .ts file"
                  color="success"
                >
                  <DownloadIcon fontSize="small" />
                </IconButton>
              )}
            </>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {content ? (
          <Box
            component="pre"
            sx={{
              margin: 0,
              padding: 2,
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              overflow: 'auto',
              flex: 1,
              backgroundColor: '#f5f5f5',
            }}
          >
            {content}
          </Box>
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '300px',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {emptyMessage}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ borderTop: 1, borderColor: 'divider', p: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OutputModal;
