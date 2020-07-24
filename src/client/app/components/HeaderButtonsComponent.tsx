/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react';
import { Link } from 'react-router';
import { Button } from 'reactstrap';
import { FormattedMessage } from 'react-intl';
import MenuModalComponent from './MenuModalComponent';
import { hasToken } from '../utils/token';
import getPage from '../utils/getPage';
import store from "../index";
import {fetchMetersDetails} from "../actions/meters";

interface HeaderButtonsProps {
	showCollapsedMenuButton: boolean;
}

/**
 * React component that controls the buttons in the Header
 */
export default class HeaderButtonsComponent extends React.Component<HeaderButtonsProps, {}> {
	constructor(props: HeaderButtonsProps) {
		super(props);
		this.handleLogOut = this.handleLogOut.bind(this);
	}

	public render() {
		const showOptions = false;
		const renderLoginButton = !hasToken();
		const renderHomeButton = getPage() !== '';
		const renderAdminButton = hasToken() && getPage() !== 'admin';
		const renderGroupsButton = getPage() !== 'groups';
		const renderMetersButton = getPage() !== 'meters';
		const renderLogoutButton = hasToken();

		const loginLinkStyle: React.CSSProperties = {
			display: renderLoginButton ? 'inline' : 'none',
			paddingLeft: '5px'
		};
		const homeLinkStyle: React.CSSProperties = {
			display: renderHomeButton ? 'inline' : 'none',
			paddingLeft: '5px'
		};
		const adminLinkStyle: React.CSSProperties = {
			display: renderAdminButton ? 'inline' : 'none'
		};
		const groupsLinkStyle: React.CSSProperties = {
			display: renderGroupsButton ? 'inline' : 'none',
			paddingLeft: '5px'
		};
		const metersLinkStyle: React.CSSProperties = {
			display: renderMetersButton ? 'inline' : 'none',
			paddingLeft: '5px'
		};
		const logoutButtonStyle: React.CSSProperties = {
			display: renderLogoutButton ? 'inline' : 'none',
			paddingLeft: '5px'
		};

		return (
			<div>
				<div className='d-lg-none'>
					{(this.props.showCollapsedMenuButton) ?
						<MenuModalComponent
							showOptions={showOptions}
							showCollapsedMenuButton={false}
						/> : null
					}
				</div>
				<div className={this.props.showCollapsedMenuButton ? 'd-none d-lg-block' : ''}>
					<Link style={adminLinkStyle} to='/admin'><Button outline><FormattedMessage id='admin.panel'/></Button></Link>
					<Link style={groupsLinkStyle} to='/groups'><Button outline><FormattedMessage id='groups' /></Button></Link>
					<Link style={metersLinkStyle} to='/meters'><Button outline><FormattedMessage id='meters' /></Button></Link>
					<Link style={homeLinkStyle} to='/'><Button outline><FormattedMessage id='home'/></Button></Link>
					<Link style={loginLinkStyle} to='/login'><Button outline><FormattedMessage id='log.in'/></Button></Link>
					<Link style={logoutButtonStyle} to='/'><Button outline onClick={this.handleLogOut}><FormattedMessage id='log.out'/></Button></Link>
				</div>
			</div>
		);
	}

	private handleLogOut() {
		localStorage.removeItem('token');
		this.forceUpdate();
		store.dispatch(fetchMetersDetails());
	}
}
