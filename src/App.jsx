import {useContext, useState, useCallback, useEffect} from 'react';
import {FormControl, FormControlLabel, FormLabel, Grid2, Radio, RadioGroup} from "@mui/material";
import {getJson, debugContext, i18nContext, doI18n} from "pithekos-lib";


function App() {
    const [maxWindowHeight, setMaxWindowHeight] = useState(window.innerHeight - 64);
    const [projectSummaries, setProjectSummaries] = useState({});
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [report, setReport] = useState([]);
    const handleWindowResize = useCallback(() => {
        setMaxWindowHeight(window.innerHeight - 64);
    }, []);
    const {i18nRef} = useContext(i18nContext);
    const {debugRef} = useContext(debugContext);

    useEffect(() => {
        window.addEventListener('resize', handleWindowResize);
        return () => {
            window.removeEventListener('resize', handleWindowResize);
        };
    }, [handleWindowResize]);

    const getProjectSummaries = async () => {
        const summariesResponse = await getJson("/burrito/metadata/summaries?org=_local_/_quarantine_", debugRef.current);
        if (summariesResponse.ok) {
            setProjectSummaries(summariesResponse.json);
        }
    }

    useEffect(
        () => {
            getProjectSummaries().then();
        },
        []
    );

    const getReport = async () => {
        const reportResponse = await getJson(`/burrito/audit/_local_/_quarantine_/${selectedRepo.split('/')[2]}`, debugRef.current);
        if (reportResponse.ok) {
            setReport(reportResponse.json);
        }
    }

    useEffect(
        () => {
            if (selectedRepo) {
                getReport().then()
            }
        },
        [selectedRepo]
    );
    return <Grid2 container spacing={2} sx={{maxHeight: maxWindowHeight}}>
        <Grid2 size={12} item>
            {
                <FormControl>
                    <FormLabel id="quarantined_repo_selection">Choose a quarantined repo</FormLabel>
                    <RadioGroup
                        aria-labelledby="quarantined_repo_selection-group-label"
                        name="quarantined-repo-radio-buttons-group"
                        value={selectedRepo}
                        onChange={e => {
                            setSelectedRepo(e.target.value)
                        }}
                    >
                        {
                            Object.entries(projectSummaries)
                                .map(
                                    (kv, n) =>
                                        <FormControlLabel
                                            key={n}
                                            value={kv[0]}
                                            control={<Radio/>}
                                            label={`${kv[1].name} (${kv[0].split("/")[2]})`}
                                        />
                                )
                        }
                    </RadioGroup>
                </FormControl>
            }
        </Grid2>
        {
            report.map(
                r => <>
                    <Grid2 size={r.success ? 10 : 4} item>{
                        r.name
                    }</Grid2>
                    {!r.success && <>
                        <Grid2 size={3} item>{
                            r.comment
                        }</Grid2>
                        <Grid2 size={3} item>{
                            r.data && r.data.join(", ")
                        }</Grid2>
                    </>
                    }
                    <Grid2 size={2} item>{
                        r.success ? "PASS" : "FAIL"
                    }</Grid2>
                </>
            )
        }
    </Grid2>
}

export default App;
