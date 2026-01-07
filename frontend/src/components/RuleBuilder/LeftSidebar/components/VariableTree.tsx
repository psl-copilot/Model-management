import React from 'react';
import { Box } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeIcon from '@mui/icons-material/Code';
import type { VariableTreeNode } from '../../../../hooks/RuleBuilder/useVariableTree';
import VariableTreeSection from './VariableTreeSection';

interface VariableTreeProps {
  localVarsTree: VariableTreeNode[];
  ruleRequestTree: VariableTreeNode[];
  ruleConfigTree: VariableTreeNode[];
}

const VariableTree: React.FC<VariableTreeProps> = ({ localVarsTree, ruleRequestTree, ruleConfigTree }) => {
  return (
    <Box sx={{ p: 1.5, overflowX: 'auto', minWidth: 0 }}>
      <Box sx={{ minWidth: 300 }}>
        {/* Local Variables Section */}
        <VariableTreeSection
          title="Local Variables"
          icon={<StorageIcon sx={{ fontSize: 18 }} />}
          color="secondary.main"
          nodes={localVarsTree}
          emptyMessage="No local variables defined yet. Use SetVariable or FetchDB nodes to create variables."
        />

        {/* Global Variables - RuleRequest */}
        <VariableTreeSection
          title="Global Variables (RuleRequest)"
          icon={<InfoOutlinedIcon sx={{ fontSize: 18 }} />}
          color="primary.main"
          nodes={ruleRequestTree}
          showDivider={true}
        />

        {/* Global Variables - RuleConfig */}
        <VariableTreeSection
          title="Global Variables (RuleConfig)"
          icon={<CodeIcon sx={{ fontSize: 18 }} />}
          color="primary.main"
          nodes={ruleConfigTree}
          showDivider={false}
        />
      </Box>
    </Box>
  );
};

export default VariableTree;
