import { Box } from "@mui/material"
import { Text } from "../../components/Text"
import BoxWrapper from "../../components/Wrappers/BoxWrapper"
import Button from "../../components/Button"
import AddIcon from '@mui/icons-material/Add';
import useHomeController from "./useHomeController";
import Table from "../../components/Table";
import Input from "../../components/Input";
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import DropDown from "../../components/DropDown";

const Home = () => {

    const { values, functions } = useHomeController()

    return (
        <BoxWrapper>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Text fontWeight={'bold'} color="black" size={'subHeader'}>Rules Home</Text>
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
                    required
                    onChange={(val) => functions.setStatus(val)}
                    multiple={false}
                />
                <DropDown
                    label="Rule Type"
                    placeholder="Select rule type"
                    options={values.rule_types}
                    value={values.ruleType ?? null}
                    required
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
