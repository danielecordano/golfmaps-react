import "./styles.css";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Drawer,
  LinearProgress,
  Button,
  List,
  Divider,
  ListItem,
  ListItemIcon,
  ListItemText,
  FormControlLabel,
  Switch
} from "@material-ui/core";

import {
  Menu,
  NavigateNext,
  NavigateBefore,
  PlayArrow,
  Brightness5,
  Launch
} from "@material-ui/icons";
import Course from "./components/Course";
import augusta from "./course.js";

export default function App() {
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
    [polylinesRef]
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
      <Button id="opener" className="opener" onClick={toggleDrawer(true)}>
        <Menu />
      </Button>
      <Drawer anchor={"left"} open={isOpen} onClose={toggleDrawer(false)}>
        <div
          className="list"
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <List>
            <ListItem button onClick={next}>
              <ListItemIcon>
                <NavigateNext />
              </ListItemIcon>
              <ListItemText primary={"Next hole"} />
            </ListItem>
            <ListItem button onClick={prev}>
              <ListItemIcon>
                <NavigateBefore />
              </ListItemIcon>
              <ListItemText primary={"Previous hole"} />
            </ListItem>
            <ListItem button onClick={toggleAutoplay}>
              <ListItemIcon>
                <PlayArrow />
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
                <Brightness5 />
              </ListItemIcon>
              <ListItemText primary={"Weather"} />
              <Launch />
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
