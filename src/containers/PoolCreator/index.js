import React, { Component } from 'react'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField
} from '@material-ui/core'

import { Button } from 'components'
import { providerService } from 'core/services'
import { appConfig } from 'configs'
import * as bFactoryService from 'core/services/bFactoryService'

class PoolCreatorView extends Component {
  constructor(props) {
    super(props)
    this.state = {
      factoryAddress: appConfig.bFactory,
      provider: null
    }
  }

  async componentWillMount() {
    // const { factoryAddress } = this.state
    const provider = await providerService.getProvider()
    this.setState({
      provider
    })
  }

  render() {
    const { provider, factoryAddress } = this.state
    const handleSubmit = async () => {
      console.log('submit')
      await bFactoryService.deployPool(provider, factoryAddress)
    }
    return (
      <Container>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h5" component="h5">New Pool Description</Typography>
                  <TextField
                    id="standard-multiline-static"
                    multiline
                    rows="4"
                    placeholder="Some new pool description"
                    margin="normal"
                  />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Button type="submit" variant="contained">Deploy New Pool</Button>
            </Grid>
          </Grid>
        </form>

      </Container>
    )
  }
}

export default PoolCreatorView