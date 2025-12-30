import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { Box } from "@mui/material";
import Button from "../../components/Button";
import DropDown from "../../components/DropDown";
import Input from "../../components/Input";
import Table from "../../components/Table";
import { Text } from "../../components/Text";
import BoxWrapper from "../../components/Wrappers/BoxWrapper";
import useHomeController from "./useHomeController";
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

const Home = () => {

    const { values, functions } = useHomeController()

    return (
        <BoxWrapper>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} gap={1}>
                    <HomeOutlinedIcon sx={{ color: '#8f57ee', fontSize: '30px' }} />
                    <Text weight={600} color="black" size={'header'}>Rules Home</Text>
                </Box>
                <Button Icon={AddIcon} height="40px" type="secondary" size="md" text="Create New Rule" onClick={functions.handleCreateNew} />
            </Box>


            <Box mt={2} display={'flex'} justifyContent={'space-between'} alignItems={'flex-end'}>
                <Input
                    maxWidth={400}
                    value={values?.searchTerm}
                    onChange={(e) => functions.setSearchTerm(e.target.value)}
                    height="sm"
                    placeholder="Search rules..."
                    leftIcon={() => <SearchIcon />}
                />
                <DropDown
                    label="Status"
                    placeholder="Select status"
                    options={values.status_options}
                    value={values.status ?? null}
                    onChange={(val) => functions.setStatus(val)}
                    multiple={false}
                />
                <DropDown
                    label="Rule Type"
                    placeholder="Select rule type"
                    options={values.rule_types}
                    value={values.ruleType ?? null}
                    onChange={(val) => functions.setRuleType(val)}
                    multiple={false}
                />
            </Box>

            <Table
                columns={values.columns}
                data={values.data}
                loading={values.isLoading}
                pagination={values.pagination}
            />
        </BoxWrapper>
    )
}

export default Home
