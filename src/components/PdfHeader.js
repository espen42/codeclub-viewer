import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {capitalize} from '../util';
import styles from './PdfHeader.scss';

const PdfHeader = ({params, courseIcon}) => {
  const {course} = params;
  return (
    <div className={styles.container}>
      <img className={styles.courseIcon} src={courseIcon}/>
      <span className={styles.course}>{capitalize(course)}</span>
    </div>
  );
};
PdfHeader.PropTypes = {
  // ownProps
  params: PropTypes.shape({
    course: PropTypes.string.isRequired,
  }),

  // mapStateToProps
  courseIcon: PropTypes.string,
};

const mapStateToProps = (state, {params}) => ({
  courseIcon: state.context.iconContext('./' + params.course + '/logo-black.png'),
});

export default connect(
  mapStateToProps
)(withStyles(styles)(PdfHeader));
