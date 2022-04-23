//import "./styles.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import LinearProgress from "@material-ui/core/LinearProgress";
import Button from "@material-ui/core/Button";
import List from "@material-ui/core/List";
import Divider from "@material-ui/core/Divider";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import MenuIcon from "@material-ui/icons/Menu";
import NavigateNextIcon from "@material-ui/icons/NavigateNext";
import NavigateBeforeIcon from "@material-ui/icons/NavigateBefore";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import Brightness5Icon from "@material-ui/icons/Brightness5";
import LaunchIcon from "@material-ui/icons/Launch";
import Course from "./Course";
import augusta from "./course.js";

const useStyles = makeStyles({
  list: {
    width: "auto"
  },
  opener: {
    position: "absolute",
    zIndex: 1,
    backgroundColor: "white",
    borderRadius: 0,
    "&:hover, &:focus": {
      backgroundColor: "white"
    }
  }
});

export default function App() {
  const classes = useStyles();
  const [isOpen, setIsOpen] = useState(false);
  const [course, setCourse] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selected, setSelected] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autos, setAutos] = useState([]);
  const [isImperial, setIsImperial] = useState(false);
  const polylinesRef = useRef([]);
  const listenersRef = useRef([]);

  useEffect(() => {
    // fetch
    setTimeout(() => {
      setCourse(augusta);
      setIsLoaded(true);
    }, 1000);
  }, []);
  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setIsOpen(open);
  };
  const stopAutoPlay = () => {
    autos.forEach((auto) => {
      clearTimeout(auto);
    });
    setIsPlaying((prevValue) => !prevValue);
  };
  const toggleAutoplay = () => {
    if (isPlaying) {
      stopAutoPlay();
    } else {
      let t = 0;
      let funcs = [];
      const f = (i) => {
        funcs[i] = setTimeout(handleClick(i), t);
        t += 4000;
      };
      for (let i = 0; i < 18; i++) {
        f(i);
      }
      funcs[18] = setTimeout(stopAutoPlay, t);
      setAutos(funcs);
      setIsPlaying((prevValue) => !prevValue);
    }
  };
  const handleClick = (index) => (e) => {
    setSelected(index);
  };
  const handleCloseClick = (index, vertex) => () => {
    const path = polylinesRef.current[index].getPath();
    if (path.getLength() > 2) path.removeAt(vertex);
  };
  const handleEdit = useCallback(
    (index) => () => {
      setCourse((prevCourse) => {
        let newCourse = { ...prevCourse };
        const newPath = polylinesRef.current[index]
          .getPath()
          .getArray()
          .map((vertex) => vertex.toJSON());
        newCourse.holes[index] = newPath;
        return newCourse;
      });
    },
    [setCourse, polylinesRef]
  );
  const handleLoad = useCallback(
    (index) => (polyline) => {
      polylinesRef.current[index] = polyline;
      const path = polyline.getPath();
      listenersRef.current[index] = [];
      listenersRef.current[index].push(
        path.addListener("set_at", handleEdit(index)),
        path.addListener("insert_at", handleEdit(index)),
        path.addListener("remove_at", handleEdit(index))
      );
    },
    [handleEdit]
  );
  const handleUnmount = useCallback(
    (index) => () => {
      listenersRef.current[index].forEach((lis) => lis.remove());
      polylinesRef.current[index] = null;
    },
    []
  );
  const next = () => {
    var newHole = (selected + 1) % 18;
    setSelected(newHole);
  };
  const prev = () => {
    var newHole = (selected - 1) % 18;
    setSelected(newHole);
  };
  const toggleUnit = () => {
    setIsImperial((prevValue) => !prevValue);
  };
  const searchWeather = () => {
    const ll = course.holes[0][0];
    const q = ll.lat.toFixed(3) + "," + ll.lng.toFixed(3);
    window.open("https://weather.com/weather/5day/l/" + q);
  };
  return (
    <>
      <Button
        id="opener"
        className={classes.opener}
        onClick={toggleDrawer(true)}
      >
        <MenuIcon />
      </Button>
      <Drawer anchor={"left"} open={isOpen} onClose={toggleDrawer(false)}>
        <div
          className={classes.list}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button onClick={next}>
              <ListItemIcon>
                <NavigateNextIcon />
              </ListItemIcon>
              <ListItemText primary={"Next hole"} />
            </ListItem>
            <ListItem button onClick={prev}>
              <ListItemIcon>
                <NavigateBeforeIcon />
              </ListItemIcon>
              <ListItemText primary={"Previous hole"} />
            </ListItem>
            <ListItem button onClick={toggleAutoplay}>
              <ListItemIcon>
                <PlayArrowIcon />
              </ListItemIcon>
              <ListItemText
                primary={isPlaying ? "Stop autoplay" : "Autoplay"}
              />
            </ListItem>
          </List>
          <Divider />
          <ListItem>
            <FormControlLabel
              control={
                <Switch
                  checked={isImperial}
                  onChange={toggleUnit}
                  color="default"
                  name="imperial units"
                />
              }
              label="Imperial units"
            />
          </ListItem>
          <Divider />
          <List>
            <ListItem button onClick={searchWeather}>
              <ListItemIcon>
                <Brightness5Icon />
              </ListItemIcon>
              <ListItemText primary={"Weather"} />
              <LaunchIcon />
            </ListItem>
          </List>
        </div>
      </Drawer>
      {isLoaded ? (
        <Course
          holes={course.holes}
          selected={selected}
          handleClick={handleClick}
          handleCloseClick={handleCloseClick}
          handleEdit={handleEdit}
          handleLoad={handleLoad}
          handleUnmount={handleUnmount}
          polylinesRef={polylinesRef}
          isImperial={isImperial}
        />
      ) : (
        <LinearProgress />
      )}
    </>
  );
}
