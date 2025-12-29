import { Box } from "@mui/material"
import { Text } from "../../components/Text"
import BoxWrapper from "../../components/Wrappers/BoxWrapper"
import Button from "../../components/Button"
import AddIcon from '@mui/icons-material/Add';
import useHomeController from "./useHomeController";
import Table from "../../components/Table";
import Input from "../../components/Input";
import SearchIcon from '@mui/icons-material/Search';

const Home = () => {

    const { values, functions } = useHomeController()

    return (
        <BoxWrapper>
            <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                <Text fontWeight={'bold'} color="black" size={'subHeader'}>Rules Home</Text>
                <Button Icon={AddIcon} height="45px" type="secondary" size="md" text="Create New Rule" onClick={functions.handleCreateNew} />
            </Box>


            <Box>
                <Input
                    maxWidth={400}
                    height="sm"
                    placeholder="Search rules..."
                    leftIcon={() => <SearchIcon />}
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
