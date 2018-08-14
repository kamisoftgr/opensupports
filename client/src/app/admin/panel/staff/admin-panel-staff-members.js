import React from 'react';
import {Link} from 'react-router';
import _ from 'lodash';
import {connect}  from 'react-redux';

import AdminDataActions from 'actions/admin-data-actions';

import i18n from 'lib-app/i18n';
import API from 'lib-app/api-call';
import SessionStore from 'lib-app/session-store';
import PeopleList from 'app-components/people-list';
import ModalContainer from 'app-components/modal-container';

import AddStaffModal from 'app/admin/panel/staff/add-staff-modal';

import Header from 'core-components/header';
import DropDown from 'core-components/drop-down';
import Button from 'core-components/button';
import Icon from 'core-components/icon';
import Loading from 'core-components/loading';

class AdminPanelStaffMembers extends React.Component {

    static propTypes = {
        staffList: React.PropTypes.array,
        loading: React.PropTypes.bool,
    }

    static defaultProps = {
        staffList: [],
        loading: true,
    };

    state = {
        selectedDepartment: 0,
        page: 1
    };

    componentDidMount() {
        this.retrieveStaffMembers();
    }

    render() {
        return (
            <div className="admin-panel-staff-members">
                <Header title={i18n('STAFF_MEMBERS')} description={i18n('STAFF_MEMBERS_DESCRIPTION')} />
                <div className="admin-panel-staff-members__wrapper">
                    <DropDown {...this.getDepartmentDropdownProps()} className="admin-panel-staff-members__dropdown" />
                    <Button onClick={this.onAddNewStaff.bind(this)} size="medium" type="secondary" className="admin-panel-staff-members__button">
                        <Icon name="user-plus" className=""/> {i18n('ADD_NEW_STAFF')}
                    </Button>
                </div>
                {(this.props.loading) ? <Loading backgrounded /> : <PeopleList list={this.getStaffList()} page={this.state.page} onPageSelect={(index) => this.setState({page: index+1})} />}
            </div>
        );
    }

    onAddNewStaff() {
        ModalContainer.openModal(<AddStaffModal onSuccess={this.retrieveStaffMembers.bind(this)} />);
    }

    getDepartmentDropdownProps() {
        return {
            items: this.getDepartments(),
            onChange: (event) => {
                let departments = SessionStore.getDepartments();
                this.setState({
                    selectedDepartment: event.index && departments[event.index - 1].id,
                    page: 1
                });
            },
            size: 'medium'
        };
    }

    getStaffList() {
        let staffList;

        if(!this.state.selectedDepartment) {
            staffList = this.props.staffList;
        } else {
            staffList = _.filter(this.props.staffList, (staff) => {
                return _.findIndex(staff.departments, {id: this.state.selectedDepartment}) !== -1;
            });
        }

        return staffList.map(staff => {
            return _.extend({}, staff, {
                profilePic: (staff.profilePic) ? API.getFileLink(staff.profilePic) : (API.getURL() + '/images/profile.png'),
                name: (
                    <Link className="admin-panel-staff-members__link" to={'/admin/panel/staff/view-staff/' + staff.id}>
                        {staff.name}
                    </Link>
                )
            });
        });
    }

    getDepartments() {
        let departments = SessionStore.getDepartments().map((department) => {
            return {content: department.name};
        });

        departments.unshift({
            content: i18n('ALL_DEPARTMENTS')
        });

        return departments;
    }

    retrieveStaffMembers() {
        this.props.dispatch(AdminDataActions.retrieveStaffMembers());
    }
}

export default connect((store) => {
    return {
        staffList: store.adminData.staffMembers,
        loading: !store.adminData.staffMembersLoaded,
        error: store.adminData.staffMembersError
    };
})(AdminPanelStaffMembers);
