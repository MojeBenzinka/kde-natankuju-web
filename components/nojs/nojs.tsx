import React from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import SentimentDissatisfiedIcon from "@mui/icons-material/SentimentDissatisfied";

const NoJS: React.FC = () => {
  return (
    <Container fixed>
      <SentimentDissatisfiedIcon fontSize={"large"} />
      <Typography>
        This website requires JavaScript to be enabled. Please enable JavaScript
        in your browser.
      </Typography>
      <Typography>
        <a
          href="https://www.enable-javascript.com/"
          target="_blank"
          rel="noreferrer"
        >
          Learn how to enable JavaScript
        </a>
      </Typography>
    </Container>
  );
};

export default NoJS;
